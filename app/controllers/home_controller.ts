import type { HttpContext } from '@adonisjs/core/http'
import Tweet from '#models/tweet'
import db from '@adonisjs/lucid/services/db'

export default class HomeController {
  // =========================================================================
  // Affichage 'home' fil d'actualité 'index'
  // =========================================================================

  async index({ view, request, auth, session }: HttpContext) {
    // 1. Récupérer l'utilisateur connecté
    const user = auth.getUserOrFail()

    // 2. Récupérer l'onglet actif (défaut: 'for-you')
    const tab = session.flashMessages.get('activeTab') || request.input('tab', 'for-you')

    // 3. Construire la requête
    const tweetsQuery = Tweet.query()
      .whereNull('parentId')
      .preload('user')
      .preload('replies')
      .select('*')
      .select(
        db.raw(
          '(SELECT EXISTS (SELECT 1 FROM likes WHERE tweet_id = tweets.id AND user_id = ?)) as is_liked',
          [user.id]
        )
      )
      .orderBy('createdAt', 'desc')
      .limit(500)

    // 4. Logique de l'onglet Following (Abonnements)
    if (tab === 'following') {
      tweetsQuery.whereIn('userId', (query) => {
        query.from('follows').select('following_id').where('follower_id', user.id)
      })
    }

    // 5. Exécuter la requête
    const tweets = await tweetsQuery

    // 6. Transférer l'état de $extras vers le modèle pour Edge
    tweets.forEach((tweet) => {
      tweet.isLiked = Boolean(tweet.$extras.is_liked)
    })

    // 7. Renvoyer la vue
    return view.render('pages/home', {
      tweets,
      tab,
      user,
    })
  }

  /**
   * Notifications
   */
  async notifications({ view, auth }: HttpContext) {
    return view.render('pages/notifications', { user: auth.user })
  }
}
