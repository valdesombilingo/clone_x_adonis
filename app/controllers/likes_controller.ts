// NOTE : Gestion de l'interaction "Liker/Unliker" via une logique de bascule (Toggle).
// Grâce aux Hooks Lucid du modèle Like ce controller :
// - Vérifie si un Like existe déjà pour le couple (User, Tweet).
// - Si présent : Supprime le Like (déclenche le hook afterDelete du modèle).
// - Si absent : Crée le Like (déclenche le hook afterCreate du modèle).

import type { HttpContext } from '@adonisjs/core/http'
import Like from '#models/like'

export default class LikesController {
  async toggleLike({ auth, params, response, request }: HttpContext) {
    const user = auth.getUserOrFail()
    const tweetId = Number(params.id)

    // Vérification si le like existe déjà
    const existingLike = await Like.query()
      .where('userId', user.id)
      .where('tweetId', tweetId)
      .first()

    if (existingLike) {
      // hook afterDelete décrémente likesCount
      await existingLike.delete()
    } else {
      // hook afterCreate incrémente likesCount
      await Like.create({ userId: user.id, tweetId })
    }

    // On récupère l'onglet depuis le referer pour le flasher en session
    const queryParams = request.qs()

    // On redirige vers la page d'où on vient
    return response.redirect().withQs(queryParams).back()
  }
}
