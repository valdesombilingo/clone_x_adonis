import { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import PasswordReset from '#models/password_reset'
import mail from '@adonisjs/mail/services/main'
import env from '#start/env'
import crypto from 'node:crypto'
import { DateTime } from 'luxon'

/**
 * Contrôleur pour la gestion des réinitialisations de mot de passe
 * - Affichage du formulaire Mot de passe oublié 'showForgotPasswordForm'
 * - Véification de l'email 'forgotPassword'
 * - Affichage du formulaire de réinitialisation 'showResetPasswordForm'
 * - Réinitialisation du mot de passe 'resetPassword'
 */

export default class PasswordResetsController {
  // =========================================================================
  // Mot de passe oublié 'forgotPassword'
  // =========================================================================

  // 1. Affiche la page "Mot de passe oublié" (showForgotPasswordForm)
  async showForgotPasswordForm({ view }: HttpContext) {
    return view.render('pages/auth/forgot_password')
  }

  // 2. Traite la demande et envoie l'email
  async forgotPassword({ request, response, session }: HttpContext) {
    const email = request.input('email')
    const user = await User.query().where('email', email).first()

    if (!user) {
      session.flash('error', 'Aucun compte trouvé avec cet email.')
      return response.redirect().back()
    }

    try {
      // Nettoyage des anciens tokens
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

      session.flash('success', 'Un email de réinitialisation vous a été envoyé.')
      return response.redirect().toRoute('login')
    } catch (error) {
      session.flash('error', 'Erreur technique. Réessayez plus tard.')
      return response.redirect().back()
    }
  }

  // =========================================================================
  // Réinitialisation du mot de passe 'resetPassword'
  // =========================================================================

  // 1. Affiche le formulaire de réinitialisation du mot de passe (showResetPasswordForm)
  async showResetPasswordForm({ view, params, session, response }: HttpContext) {
    const token = params.token
    const record = await PasswordReset.query().where('token', token).first()

    if (!record || DateTime.now() > record.expiresAt) {
      session.flash('error', 'Lien invalide ou expiré.')
      return response.redirect().toRoute('show_forgot_password')
    }

    return view.render('pages/auth/reset_password', { token })
  }

  // 2. Enregistre le nouveau mot de passe en base
  async resetPassword({ request, response, session }: HttpContext) {
    const { token, password, confirmPassword } = request.only([
      'token',
      'password',
      'confirmPassword',
    ])

    const record = await PasswordReset.query().where('token', token).first()
    if (!record || DateTime.now() > record.expiresAt) {
      session.flash('error', 'Lien expiré.')
      return response.redirect().toRoute('forgotPassword')
    }

    const user = await User.findOrFail(record.userId)

    if (password !== confirmPassword) {
      session.flash('error', 'Les mots de passe ne correspondent pas.')
      return response.redirect().back()
    }

    // Mise à jour du user
    user.password = password
    await user.save()
    await record.delete()

    session.flash('success', 'Mot de passe modifié avec succès.')
    return response.redirect().toRoute('login')
  }
}
