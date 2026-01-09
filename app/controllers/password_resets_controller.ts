import { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import PasswordReset from '#models/password_reset'
import mail from '@adonisjs/mail/services/main'
import env from '#start/env'
import crypto from 'node:crypto'
import { DateTime } from 'luxon'
import { forgotPasswordValidator } from '#validators/forgot_password'
import { resetPasswordValidator } from '#validators/reset_password'
export default class PasswordResetsController {
  /**
   * NOTE :  Contrôleur pour la gestion des réinitialisations de mot de passe
   * - Affichage du formulaire Mot de passe oublié 'showForgotPasswordForm'
   * - Véification de l'email 'forgotPassword'
   * - Affichage du formulaire de réinitialisation 'showResetPasswordForm'
   * - Réinitialisation du mot de passe 'resetPassword'
   */

  // =========================================================================
  // Mot de passe oublié 'forgotPassword'
  // =========================================================================

  // 1. Affiche la page "Mot de passe oublié"

  async showForgotPasswordForm({ view }: HttpContext) {
    return view.render('pages/auth/forgot_password')
  }

  //  2. Traite la demande et envoie l'email
  async forgotPassword({ request, response, session }: HttpContext) {
    // Validation du format de l'email
    const { email } = await request.validateUsing(forgotPasswordValidator)

    const user = await User.findBy('email', email)

    if (user) {
      // Nettoyage des anciens jetons
      await PasswordReset.query().where('userId', user.id).delete()

      const resetToken = crypto.randomBytes(60).toString('hex')

      await PasswordReset.create({
        userId: user.id,
        token: resetToken,
        expiresAt: DateTime.now().plus({ hours: 1 }),
      })

      const resetUrl = `${env.get('APP_URL')}/reset-password/${resetToken}`

      await mail.send((message) => {
        message
          .to(user.email)
          .from('no-reply@clone-x.com')
          .subject('Réinitialisation de votre mot de passe')
          .htmlView('emails/reset_password_email', { user, resetUrl })
      })
    }

    // Message flash (UX sécurisée)
    session.flash(
      'success',
      'Lien de réinitialisation envoyé. Veuillez vérifier vos emails ou vos spams.'
    )
    return response.redirect().toRoute('login')
  }

  // =========================================================================
  // Réinitialisation du mot de passe 'resetPassword'
  // =========================================================================

  // 3. Affiche le formulaire de réinitialisation
  async showResetPasswordForm({ view, params, session, response }: HttpContext) {
    const token = params.token

    // Vérification de la validité du jeton en base
    const record = await PasswordReset.query()
      .where('token', token)
      .where('expiresAt', '>', DateTime.now().toSQL())
      .first()

    if (!record) {
      session.flash('error', 'Le lien de réinitialisation est invalide ou a expiré.')
      return response.redirect().toRoute('show_forgot_password')
    }

    return view.render('pages/auth/reset_password', { token })
  }

  // 4. Enregistre le nouveau mot de passe
  async resetPassword({ request, response, session }: HttpContext) {
    // Validation (vérifie la présence du token et la confirmation du mot de passe)
    const { token, password } = await request.validateUsing(resetPasswordValidator)

    // Recherche du jeton valide
    const record = await PasswordReset.query()
      .where('token', token)
      .where('expiresAt', '>', DateTime.now().toSQL())
      .first()

    if (!record) {
      session.flash('error', 'La session de réinitialisation a expiré.')
      return response.redirect().toRoute('show_forgot_password')
    }

    // Récupération de l'utilisateur et mise à jour
    const user = await User.findOrFail(record.userId)
    user.password = password
    await user.save()

    // Suppression du jeton utilisé
    await record.delete()

    session.flash(
      'success',
      'Votre mot de passe a été modifié avec succès. Vous pouvez vous connecter.'
    )
    return response.redirect().toRoute('login')
  }
}
