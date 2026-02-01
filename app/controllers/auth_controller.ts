import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import router from '@adonisjs/core/services/router'
import env from '#start/env'
import { DateTime } from 'luxon'
import { storeUserValidator } from '#validators/store_user'
import { authenticateValidator } from '#validators/auth'
import crypto from 'node:crypto'
import mail from '@adonisjs/mail/services/main'

/**
 * Contrôleur d'authentification :
 * - Inscription (storeUser)
 * - Connexion (authenticate)
 * - Déconnexion (logout)
 * - Renvoyer un nouveau mail de vérification (resendEmailVerification)
 */
export default class AuthController {
  // =========================================================================
  // Inscription 'storeUser'
  // =========================================================================

  async storeUser({ request, response, session }: HttpContext) {
    // 1. Validation des données
    const validatedData = await request.validateUsing(storeUserValidator)
    try {
      const {
        full_name: fullName,
        date_of_birth: dateOfBirth,
        password_confirmation: passwordConfirmation,
        ...dataToStore
      } = validatedData

      let processedDateOfBirth = null
      if (dateOfBirth) {
        processedDateOfBirth = DateTime.fromJSDate(dateOfBirth)
      }

      // 2. Vérification si un utilisateur existe déjà avec cet email
      const existingUser = await User.query().where('email', dataToStore.email).first()
      if (existingUser) {
        if (!existingUser.isEmailVerified) {
          // Cas : email déjà utilisé mais non validé
          session.flash(
            'error',
            'Un compte existe déjà avec cet email. Vérifiez votre boîte mail pour valider votre compte.'
          )
          return response.redirect().toRoute('verification_needed')
        } else {
          // Cas : email déjà utilisé et validé
          session.flash('error', 'Un compte existe déjà avec cet email. Veuillez vous connecter.')
          return response.redirect().toRoute('login')
        }
      }

      // 3. Génération du Username unique
      const base = User.createBaseUsername(fullName)
      const uniqueUsername = await User.generateUniqueUsername(base)

      // 4. Génération du Token de vérification
      const emailVerificationToken = crypto.randomBytes(60).toString('hex')

      // 5. Création utilisateur
      const user = await User.create({
        ...dataToStore,
        fullName,
        userName: uniqueUsername,
        dateOfBirth: processedDateOfBirth,
        isEmailVerified: false,
        emailVerificationToken,
        emailTokenExpiresAt: DateTime.now().plus({ hours: 24 }),
        emailVerifiedAt: null,
      })

      // 6. Envoi du mail de vérification

      const verificationUrl = router.makeUrl('verify_email', [user.emailVerificationToken], {
        prefixUrl: env.get('APP_URL'),
      })
      session.put('verification_email', user.email)
      try {
        await mail.send((message) => {
          message
            .to(user.email)
            .from('no-reply@tonapp.com')
            .subject('Confirmez votre adresse email')
            .htmlView('emails/verify_email', { user, verificationUrl })
        })
      } catch (mailError) {
        console.error('Erreur lors de l’envoi du mail :', mailError)
        session.flash('error', 'Erreur lors de l’envoi du mail.')
        return response.redirect().back()
      }

      // 7. Message flash de succès et Redirection
      session.flash(
        'success',
        'Inscription réussie. Veuillez vérifier votre boîte mail pour valider votre compte.'
      )
      return response.redirect().toRoute('verification_needed')
    } catch (error) {
      // Gestion des erreurs critiques
      session.flash('error', 'Oups... Une erreur est survenue. Veuillez réessayer.')
      console.error(error)
      return response.redirect().back()
    }
  }

  // =========================================================================
  // Connexion 'authenticate'
  // =========================================================================

  async authenticate({ request, response, auth, session }: HttpContext) {
    // 1. Validation (Laisser Adonis gérer l'exception de validation)
    const { email, password } = await request.validateUsing(authenticateValidator)

    try {
      // 2. Vérification simplifiée via la méthode statique du modèle User
      const user = await User.verifyCredentials(email, password)

      // 3. Vérification email
      if (!user.isEmailVerified) {
        session.put('verification_email', user.email)
        session.flash('error', 'Veuillez vérifier votre email.')
        return response.redirect().toRoute('verification_needed')
      }

      // 4. Connexion
      await auth.use('web').login(user)
      return response.redirect().toRoute('home')
    } catch (error) {
      session.flash('error', 'Email ou mot de passe invalide.')
      return response.redirect().back()
    }
  }

  // =========================================================================
  // Déconnexion 'logout'
  // =========================================================================

  async logout({ auth, response, session }: HttpContext) {
    await auth.use('web').logout()
    session.flash('success', 'Déconnexion réussie. À bientôt !')
    return response.redirect().toRoute('landing')
  }

  // =========================================================================
  // Renvoyer un nouveau mail de vérification 'resendEmailVerification'
  // =========================================================================

  async resendEmailVerification({ response, session }: HttpContext) {
    // On récupère l'email depuis la session
    const email = session.get('verification_email')

    // 1. Trouver l'utilisateur
    if (!email) {
      session.flash('error', 'Session expirée. Veuillez saisir à nouveau vos identifiants.')
      return response.redirect().toRoute('login')
    }

    const user = await User.findBy('email', email)

    if (!user) {
      session.flash('success', 'Si ce compte existe, un nouveau lien a été envoyé.')
      return response.redirect().toRoute('login')
    }

    // 2. Vérifier si déjà validé
    if (user.isEmailVerified) {
      session.flash('success', 'Votre email est déjà confirmé. Vous pouvez vous connecter.')
      return response.redirect().toRoute('login')
    }

    // 3. Vérification du délai (1 minute)
    const now = DateTime.now()
    const canResendAt = user.emailTokenExpiresAt?.minus({ hours: 23, minutes: 59 })
    if (canResendAt && now < canResendAt) {
      session.flash('error', 'Veuillez patienter 1 minute avant de demander un nouveau lien.')
      return response.redirect().back()
    }

    // 4. Générer le nouveau token
    const newToken = crypto.randomBytes(60).toString('hex')
    user.emailVerificationToken = newToken
    user.emailTokenExpiresAt = DateTime.now().plus({ hours: 24 })
    await user.save()

    // 5. Générer l'URL proprement via le Router
    const verificationUrl = router.makeUrl('verify_email', [user.emailVerificationToken], {
      prefixUrl: env.get('APP_URL'),
    })

    // 6. Envoi du mail
    await mail.send((message) => {
      message
        .to(user.email)
        .from('no-reply@tonapp.com')
        .subject('Confirmez votre adresse email')
        .htmlView('emails/verify_email', { user, verificationUrl })
    })

    session.flash('success', 'Un nouveau lien de vérification vous a été envoyé.')
    return response.redirect().toRoute('verification_needed')
  }
}
