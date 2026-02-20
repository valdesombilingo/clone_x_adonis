import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import Follow from '#models/follow'

// middleware de gestion de compte privé

export default class ProfilePrivacyMiddleware {
  async handle({ params, auth }: HttpContext, next: () => Promise<void>) {
    const authUser = auth.user

    // Si le paramètre est absent, passe au middleware suivant ou renvoie une erreur
    if (!params.username) {
      return await next()
    }

    const targetUser = await User.query().where('userName', params.username).first()

    // Si utilisateur n'existe pas, laisse le contrôleur gérer
    if (!targetUser) {
      return await next()
    }

    // 1. Autorise si public ou si c'est moi
    if (!targetUser.isPrivate || (authUser && authUser.id === targetUser.id)) {
      return await next()
    }

    // 2. Vérifie le follow accepté
    const isFollowing =
      authUser &&
      (await Follow.query()
        .where('followerId', authUser.id)
        .where('followingId', targetUser.id)
        .where('isAccepted', true)
        .first())

    if (!isFollowing) {
      return await next()
    }

    await next()
  }
}
