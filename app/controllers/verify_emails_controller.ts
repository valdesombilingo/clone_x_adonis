import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { DateTime } from 'luxon'

/**
 * NOTE : VerifyEmailsController
 * Gère la validation des adresses email via un jeton (token) unique.
 */
export default class VerifyEmailsController {
  /**
   * handleVerification
   * Traite le clic sur le lien de confirmation envoyé par email.
   */
  async handleVerification({ params, response, session, auth }: HttpContext) {
    // 1. Récupération du token depuis l'URL
    const token = params.token

    // 2. Recherche de l'utilisateur associé à ce jeton
    const user = await User.query().where('emailVerificationToken', token).first()

    // 3. Gestion du cas où le jeton n'existe pas ou est invalide
    if (!user) {
      session.flash('error', 'Lien invalide ou utilisateur introuvable.')
      return response.redirect().toRoute('register')
    }

    // 4. Vérification de l'expiration du jeton (Sécurité accrue)
    if (user.emailTokenExpiresAt && DateTime.now() > user.emailTokenExpiresAt) {
      session.flash('error', 'Lien expiré. Veuillez demander un nouveau lien.')
      return response.redirect().toRoute('verification_needed')
    }

    // 5. Mise à jour du statut de l'utilisateur
    user.isEmailVerified = true
    user.emailVerifiedAt = DateTime.now()
    user.emailVerificationToken = null
    await user.save()

    // 6. Connexion automatique de l'utilisateur
    await auth.use('web').login(user)

    // 7. Notification de succès et redirection home
    session.flash('success', `Votre email a été confirmé. Bienvenue ${user.fullName} !`)
    return response.redirect().toRoute('home')
  }
}
