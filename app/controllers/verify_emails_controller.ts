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
  async handleVerification({ params, response, session }: HttpContext) {
    const token = params.token

    // 1. Recherche de l'utilisateur
    const user = await User.query().where('emailVerificationToken', token).first()

    // 2. Gestion Jeton Invalide (Redirection vers Login)
    if (!user) {
      session.flash('error', 'Ce lien de vérification est invalide.')
      return response.redirect().toRoute('login')
    }

    // 3. Gestion Jeton Expiré
    if (user.emailTokenExpiresAt && DateTime.now() > user.emailTokenExpiresAt) {
      session.flash('error', 'Le lien a expiré. Veuillez en demander un nouveau.')
      return response.redirect().toRoute('verification_needed')
    }

    // 4. Validation du compte et nettoyage COMPLET
    user.isEmailVerified = true
    user.emailVerifiedAt = DateTime.now()
    user.emailVerificationToken = null
    user.emailTokenExpiresAt = null
    await user.save()

    // 5. Succès et redirection vers Login (Plus sécurisé que l'auto-login)
    session.flash('success', 'Email confirmé avec succès ! Vous pouvez maintenant vous connecter.')
    return response.redirect().toRoute('login')
  }
}
