import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { DateTime } from 'luxon'

export default class VerifyEmailsController {
  /**
   * NOTE: Ce Controller Vérifie le token de confirmation d'email
   */
  async handleVerification({ params, response, auth, session }: HttpContext) {
    try {
      // 1. Recherche de l'utilisateur avec le token
      const user = await User.query().where('emailVerificationToken', params.token).first()

      if (!user) {
        session.flash(
          'error',
          'Lien de vérification invalide ou expiré. Veuillez demander un nouveau lien.'
        )
        return response.redirect().toRoute('verification_needed')
      }

      // 2. Vérification de l’expiration du token (24h après création du compte)
      const tokenCreatedAt = user.createdAt
      const now = DateTime.now()
      if (tokenCreatedAt && now.diff(tokenCreatedAt, 'hours').hours > 24) {
        session.flash('error', 'Lien de vérification expiré. Veuillez demander un nouveau lien.')
        return response.redirect().toRoute('verification_needed')
      }

      // 3. Validation du compte
      user.isEmailVerified = true
      user.emailVerificationToken = null
      user.emailTokenExpiresAt = null
      user.emailVerifiedAt = DateTime.now()
      await user.save()

      // 4. Connexion automatique avec session longue (30 jours)
      await auth.use('web').login(user, true)

      // 5. Message flash de succès et redirection
      session.flash('success', `Bienvenue, ${user.fullName} !`)
      return response.redirect().toRoute('home')
    } catch (error) {
      console.error(error)
      session.flash('error', 'Une erreur est survenue. Veuillez réessayer.')
      return response.redirect().toRoute('verification_needed')
    }
  }
}
