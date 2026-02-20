import type { HttpContext } from '@adonisjs/core/http'
import Tweet from '#models/tweet'
import db from '@adonisjs/lucid/services/db'

export default class HomeController {
  // =========================================================================
  // Affichage 'home' fil d'actualité 'index'
  // =========================================================================

  async index({ view, request, auth, session }: HttpContext) {
    const user = auth.getUserOrFail()
    const tab = session.flashMessages.get('activeTab') || request.input('tab', 'for-you')

    // 1. RÉCUPÉRER TOUS LES IDS DE BLOCAGE
    const blocks = await db
      .from('blocks')
      .where('blocker_id', user.id)
      .select('blocked_id as id')
      .union(db.from('blocks').where('blocked_id', user.id).select('blocker_id as id'))
    const excludeIds = blocks.map((b) => b.id)

    // 2. CONSTRUIRE LA REQUÊTE
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

    // 3. EXCLURE LES TWEETS DES COMPTES BLOQUÉS ET BLOQUANTS EN PLUS FILTRE COMPTE PRIVÉ
    if (excludeIds.length > 0) {
      tweetsQuery.whereNotIn('userId', excludeIds)
    }

    tweetsQuery.where((q) => {
      q.whereIn('userId', (sub) => {
        sub.from('users').select('id').where('is_private', false)
      })
        .orWhere('userId', user.id)
        .orWhereIn('userId', (sub) => {
          sub
            .from('follows')
            .select('following_id')
            .where('follower_id', user.id)
            .where('is_accepted', true)
        })
    })

    // 4. LOGIQUE DE L'ONGLET FOLLOWING
    if (tab === 'following') {
      tweetsQuery.whereIn('userId', (query) => {
        query
          .from('follows')
          .select('following_id')
          .where('follower_id', user.id)
          .where('is_accepted', true)
      })
    }

    // 5. EXÉCUTION DE LA REQUÊTE
    const tweets = await tweetsQuery

    // Transférer l'état de $extras vers le modèle pour Edge
    tweets.forEach((tweet) => {
      tweet.isLiked = Boolean(tweet.$extras.is_liked)
    })

    return view.render('pages/home', {
      tweets,
      tab,
      user,
    })
  }
}
