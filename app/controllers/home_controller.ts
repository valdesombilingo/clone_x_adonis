import type { HttpContext } from '@adonisjs/core/http'
import Tweet from '#models/tweet'
import db from '@adonisjs/lucid/services/db'

export default class HomeController {
  /**
   * Affichage 'home' (Fil d'actualité)
   */

  async index({ view, request, auth }: HttpContext) {
    // 1. Récupérer l'utilisateur connecté
    const user = auth.getUserOrFail()

    // 2. Récupérer l'onglet actif depuis la requête (défaut: 'for-you')
    const tab = request.input('tab', 'for-you')

    // 3. Récupérer le curseur (dernier tweet déjà affiché)
    const cursor = request.input('cursor')

    // 4. Construire la requête de base pour les tweets
    const tweetsQuery = Tweet.query()
      .preload('user')
      .select(['id', 'userId', 'content', 'mediaUrl', 'createdAt', 'likesCount'])
      .select(
        db.raw(
          '(SELECT EXISTS (SELECT 1 FROM likes WHERE tweet_id = tweets.id AND user_id = ?)) as "isLiked"',
          [user.id]
        )
      )
      .orderBy('createdAt', 'desc')
      .limit(50) // lot de tweets par requête

    // 5. Filtrer selon l’onglet sélectionné
    if (tab === 'following') {
      tweetsQuery.whereIn('userId', (query) => {
        query.from('follows').select('following_id').where('follower_id', user.id)
      })
    }

    // 6. Appliquer le curseur si présent (tweets plus anciens que le dernier affiché)
    if (cursor) {
      tweetsQuery.where('id', '<', cursor)
    }

    // 7. Exécuter la requête
    const tweets = await tweetsQuery

    // 8. Renvoyer la vue avec les données nécessaires
    return view.render('pages/home', { tweets, tab, user })
  }

  /**
   * Recherche
   */
  async search({ view, auth }: HttpContext) {
    return view.render('pages/search', { user: auth.user })
  }

  /**
   * Notifications
   */
  async notifications({ view, auth }: HttpContext) {
    return view.render('pages/notifications', { user: auth.user })
  }

  /**
   * Profil Utilisateur
   */
  async profile({ view, auth }: HttpContext) {
    return view.render('pages/profile', { user: auth.user })
  }
}
