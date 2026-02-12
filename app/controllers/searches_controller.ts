import { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import User from '#models/user'
import Tweet from '#models/tweet'

/**
 * Contrôleur de Recherche (Searches) :
 * - Affichage et logique de recherche (search)
 */
export default class SearchController {
  // =========================================================================
  // Affichage et logique de recherche 'search'
  // =========================================================================
  async search({ request, view, auth, session }: HttpContext) {
    const user = auth.getUserOrFail()
    const query = request.input('q', '').trim()

    // On récupère l'onglet
    const tab = request.input('tab') || session.flashMessages.get('activeTab') || 'hashtags'

    // Si la requête est vide, renvoie d'une liste vide
    if (!query) {
      return view.render('pages/search', { query: '', tab, results: [], user })
    }

    // 1. RÉCUPÉRATION DES IDS BLOQUÉS
    const blocksAsBlocker = await db
      .from('blocks')
      .where('blocker_id', user.id)
      .select('blocked_id as id')
    const blocksAsBlocked = await db
      .from('blocks')
      .where('blocked_id', user.id)
      .select('blocker_id as id')

    // On fusionne les deux tableaux d'IDs
    const excludeIds = [...blocksAsBlocker, ...blocksAsBlocked].map((b) => b.id)

    let results: any[] = []

    if (tab === 'accounts') {
      // --- LOGIQUE ONGLET COMPTES ---
      results = await User.query()
        .where((q) => {
          q.where('fullName', 'ilike', `%${query}%`).orWhere('userName', 'ilike', `%${query}%`)
        })
        .whereNot('id', user.id)
        .preload('followers', (q) => q.where('followerId', user.id))
        .preload('following', (q) => q.where('followingId', user.id))
        .select('*')
        // 1. Vérifie si MOI je le bloque
        .select(
          db.raw(
            '(SELECT EXISTS (SELECT 1 FROM blocks WHERE blocker_id = ? AND blocked_id = users.id)) as i_blocked_him',
            [user.id]
          )
        )
        // 2. Vérifie si LUI me bloque
        .select(
          db.raw(
            '(SELECT EXISTS (SELECT 1 FROM blocks WHERE blocker_id = users.id AND blocked_id = ?)) as he_blocked_me',
            [user.id]
          )
        )
        .orderBy('followersCount', 'desc')
        .limit(50)

      // On transforme les résultats bruts en booléens exploitables par Edge
      results.forEach((u) => {
        u.$extras.isFollowing = u.followers.length > 0
        u.$extras.followsYou = u.following.length > 0
        u.$extras.iBlockedHim = Boolean(u.$extras.i_blocked_him) // Ajouté
        u.$extras.heBlockedMe = Boolean(u.$extras.he_blocked_me) // Ajouté
      })
    } else {
      // LOGIQUE ONGLET HASHTAGS (TWEETS)
      const tweetQuery = Tweet.query().where((mainQuery) => {
        const cleanQuery = query.startsWith('#') ? query.slice(1) : query
        mainQuery
          .whereHas('hashtags', (hQuery) => hQuery.where('name', cleanQuery.toLowerCase()))
          .orWhere('content', 'ilike', `%${query}%`)
      })

      // On maintient l'exclusion des tweets pour ne pas "polluer" le flux
      if (excludeIds.length > 0) {
        tweetQuery.whereNotIn('userId', excludeIds)
      }

      results = await tweetQuery
        .preload('user')
        .preload('hashtags')
        .preload('parent', (pQuery) => pQuery.preload('user'))
        .select('*')
        .select(
          db.raw(
            '(SELECT EXISTS (SELECT 1 FROM likes WHERE tweet_id = tweets.id AND user_id = ?)) as is_liked',
            [user.id]
          )
        )
        .orderBy('createdAt', 'desc')

      results.forEach((tweet) => {
        tweet.isLiked = Boolean(tweet.$extras.is_liked)
      })
    }

    return view.render('pages/search', {
      query,
      tab,
      results,
      user,
    })
  }
}
