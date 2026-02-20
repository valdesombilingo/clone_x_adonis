import type { HttpContext } from '@adonisjs/core/http'
import Like from '#models/like'
import Tweet from '#models/tweet'
import db from '@adonisjs/lucid/services/db'

// NOTE : Gestion de l'interaction "Liker/Unliker" via une logique de bascule (Toggle).
// Grâce aux Hooks Lucid du modèle Like ce controller
export default class LikesController {
  // =========================================================================
  //  Méthode Toggle (Liker / Unliker) 'toggleLike'
  // =========================================================================
  async toggleLike({ auth, params, response, request }: HttpContext) {
    const user = auth.getUserOrFail()
    const tweetId = Number(params.id)

    const tweet = await Tweet.query().where('id', tweetId).preload('user').firstOrFail()

    const isAuthor = tweet.userId === user.id
    const isPublic = !tweet.user.isPrivate
    const isFollowerAccepted = await db
      .from('follows')
      .where('follower_id', user.id)
      .where('following_id', tweet.userId)
      .where('is_accepted', true)
      .first()

    if (!isPublic && !isAuthor && !isFollowerAccepted) {
      return response.forbidden("Vous n'avez pas l'autorisation de liker ce contenu.")
    }

    const existingLike = await Like.query()
      .where('userId', user.id)
      .where('tweetId', tweetId)
      .first()

    if (existingLike) {
      await existingLike.delete()
    } else {
      await Like.create({ userId: user.id, tweetId })
    }

    return response.redirect().withQs(request.qs()).back()
  }
}
