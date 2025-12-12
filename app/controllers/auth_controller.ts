import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import Hash from '@adonisjs/core/services/hash'
import { DateTime } from 'luxon'
import { storeUserValidator } from '#validators/store_user'
import { authenticateValidator } from '#validators/auth'
import crypto from 'node:crypto'
// import mail from '@adonisjs/mail/services/main'
// import UserVerificationMail from '#mails/user_verification'

/**
 * Contrôleur d'authentification :
 * - Inscription (storeUser)
 * - Connexion (authenticate)
 * - Déconnexion (logout)
 * - Renvoyer un nouveau mail de vérification (resendEmailVerification)
 */
export default class AuthController {
  // =========================================================================
  // Méthodes de Gestion du Username
  // =========================================================================

  // Génération d'un slug de base à partir du nom complet
  private createBaseUsername(fullName: string): string {
    return fullName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '')
  }

  // Garantit un 'username' unique en ajoutant un suffixe numérique si nécessaire.
  private async generateUniqueUsername(baseUsername: string): Promise<string> {
    let username = baseUsername
    let suffix = 0

    while (true) {
      const existingUser = await User.query().where('username', username).first()
      if (!existingUser) return username
      suffix++
      username = `${baseUsername}${suffix}`
    }
  }

  // =========================================================================
  // Inscription 'storeUser'
  // =========================================================================

  async storeUser({ request, response, session }: HttpContext) {
    try {
      // 1. Validation des données
      const validatedData = await request.validateUsing(storeUserValidator)

      const { full_name: fullName, date_of_birth: dateOfBirth, ...dataToStore } = validatedData

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
      const baseUsername = this.createBaseUsername(fullName)
      const uniqueUsername = await this.generateUniqueUsername(baseUsername)

      // 4. Génération du Token de vérification
      const emailVerificationToken = crypto.randomBytes(60).toString('hex')

      // 5. Création utilisateur
      await User.create({
        ...dataToStore,
        fullName,
        userName: uniqueUsername,
        dateOfBirth: processedDateOfBirth,
        isEmailVerified: false,
        emailVerificationToken,
        emailTokenExpiresAt: DateTime.now().plus({ hours: 24 }),
        emailVerifiedAt: null,
      })

      // 6. Envoi email (à activer une fois le service mail configuré)
      // await mail.sendLater(new UserVerificationMail(user))

      // 7. Message flash de succès et Redirection
      session.flash(
        'success',
        'Inscription réussie. Vérifiez votre boîte mail pour valider votre compte.'
      )
      return response.redirect().toRoute('verification_needed')
    } catch (error) {
      if (error.status === 422) {
        // Gestion des erreurs de validation
        session.flashExcept(['password', 'password_confirmation'])
        session.flash('errors', error.messages)
        return response.redirect().back()
      }

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
    const { email, password } = await request.validateUsing(authenticateValidator)

    try {
      // 1. Recherche de l'utilisateur
      const user = await User.query().where('email', email).firstOrFail()

      // 2. Vérification du mot de passe
      const isValid = await Hash.verify(user.password, password)
      if (!isValid) {
        session.flash('error', 'Email ou mot de passe incorrect.')
        return response.redirect().back()
      }

      // 3. Blocage si non vérifié
      if (!user.isEmailVerified) {
        session.flash('error', 'Veuillez vérifier votre email avant de vous connecter.')
        return response.redirect().toRoute('verification_needed')
      }

      // 4. Connexion
      await auth.use('web').login(user, true)

      // 5. Redirection avec message de succès
      session.flash('success', `Bienvenue, ${user.fullName} !`)
      return response.redirect().toRoute('home')
    } catch {
      // Gestion des erreurs (utilisateur introuvable, etc.)
      session.flashExcept(['password'])
      session.flash('error', 'Email ou mot de passe incorrect.')
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

  async resendEmailVerification({ request, response, session }: HttpContext) {
    try {
      const email = request.input('email')

      // 1. Vérifier si l’utilisateur existe
      const user = await User.query().where('email', email).first()
      if (!user) {
        session.flash('error', 'Aucun compte trouvé avec cet email.')
        return response.redirect().toRoute('login')
      }

      // 2. Vérifier si déjà validé
      if (user.isEmailVerified) {
        session.flash('success', 'Votre email est déjà confirmé. Connectez-vous directement.')
        return response.redirect().toRoute('login')
      }

      // 3. Vérifier si le lien est expiré ou invalide
      const now = DateTime.now()
      if (user.emailTokenExpiresAt && now < user.emailTokenExpiresAt) {
        session.flash('error', 'Votre lien est encore valide. Vérifiez votre boîte mail.')
        return response.redirect().toRoute('verification_needed')
      }

      // 4. Générer un nouveau token valable 1h
      const newToken = crypto.randomBytes(60).toString('hex')
      user.emailVerificationToken = newToken
      user.emailTokenExpiresAt = DateTime.now().plus({ hours: 1 })
      await user.save()

      // 5. Envoyer le mail
      // await mail.sendLater(new UserVerificationMail(user))

      session.flash(
        'success',
        'Un nouveau lien de vérification vous a été envoyé. Il est valable 1 heure.'
      )
      return response.redirect().toRoute('verification_needed')
    } catch (error) {
      console.error(error)
      session.flash('error', 'Impossible de renvoyer le lien. Veuillez réessayer.')
      return response.redirect().toRoute('verification_needed')
    }
  }
}
