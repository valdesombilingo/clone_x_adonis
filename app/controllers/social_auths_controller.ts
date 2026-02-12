import { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { DateTime } from 'luxon'

export default class SocialAuthsController {
  // 1. Redirection vers le fournisseur (google, github, etc.)
  async redirect({ ally, params }: HttpContext) {
    return ally.use(params.provider).redirect()
  }

  // 2. Callback après authentification par le fournisseur
  async callback({ ally, auth, params, response, session }: HttpContext) {
    const provider = ally.use(params.provider)

    // Gestion des erreurs communes (Annulation, etc.)
    if (provider.accessDenied() || provider.stateMisMatch() || provider.hasError()) {
      session.flash('error', `La connexion avec ${params.provider} a échoué.`)
      return response.redirect().toRoute('login')
    }

    // Récupération des données utilisateur standardisées par Ally
    const socialUser = await provider.user()

    // Logique de recherche ou création
    let user = await User.findBy('email', socialUser.email)

    if (!user) {
      // 1. Génération du Username unique
      const baseUsername = User.createBaseUsername(socialUser.name)
      const uniqueUsername = await User.generateUniqueUsername(baseUsername)

      // 2. Création de l'utilisateur avec email AUTO-VÉRIFIÉ
      user = await User.create({
        fullName: socialUser.name,
        email: socialUser.email,
        avatarUrl: socialUser.avatarUrl,
        userName: uniqueUsername,
        isEmailVerified: true,
        emailVerifiedAt: DateTime.now(),
      })

      session.flash('success', 'Compte créé avec succès via Google !')
    } else {
      // L'utilisateur existe déjà met à jour ses infos sociales si besoin
      if (!user.isEmailVerified) {
        user.isEmailVerified = true
        user.emailVerifiedAt = DateTime.now()
        await user.save()
      }
      session.flash('success', `Ravi de vous revoir, ${user.fullName} !`)
    }

    // Dans tous les cas (création ou compte existant), on connecte l'utilisateur
    await auth.use('web').login(user)

    return response.redirect().toRoute('home')
  }
}
