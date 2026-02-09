import { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import User from '#models/user'
import Tweet from '#models/tweet'

export default class SearchController {
  async search({ request, view, auth, session }: HttpContext) {
    const user = auth.getUserOrFail()
    const query = request.input('q', '').trim()

    // On récupère l'onglet (priorité à la session flash pour Unpoly, puis à l'input)
    const tab = request.input('tab') || session.flashMessages.get('activeTab') || 'hashtags'

    // Si la requête est vide, on renvoie une liste vide
    if (!query) {
      return view.render('pages/search', { query: '', tab, results: [], user })
    }

    let results: any[] = []

    if (tab === 'accounts') {
      // --- LOGIQUE ONGLET COMPTES ---
      results = await User.query()
        .where((q) => {
          // Utilisation de ilike pour l'insensibilité à la casse (PostgreSQL)
          q.where('fullName', 'ilike', `%${query}%`).orWhere('userName', 'ilike', `%${query}%`)
        })
        // On charge les relations pour calculer l'état du bouton "Suivre"
        .preload('followers', (q) => q.where('followerId', user.id))
        .preload('following', (q) => q.where('followingId', user.id))
        .orderBy('followersCount', 'desc')
        .limit(50)

      // Transforme les preloads en booléens pour Edge
      results.forEach((u) => {
        u.$extras.isFollowing = u.followers.length > 0
        u.$extras.followsYou = u.following.length > 0
      })
    } else {
      // --- LOGIQUE ONGLET HASHTAGS (TWEETS) ---
      const cleanQuery = query.startsWith('#') ? query.slice(1) : query

      results = await Tweet.query()
        .where((mainQuery) => {
          mainQuery
            .whereHas('hashtags', (hQuery) => {
              hQuery.where('name', cleanQuery.toLowerCase())
            })
            .orWhere('content', 'ilike', `%${query}%`)
        })
        .preload('user')
        .preload('hashtags')
        .preload('parent', (pQuery) => {
          pQuery.preload('user')
        })
        .select('*')
        .select(
          db.raw(
            '(SELECT EXISTS (SELECT 1 FROM likes WHERE tweet_id = tweets.id AND user_id = ?)) as is_liked',
            [user.id]
          )
        )
        .orderBy('createdAt', 'desc')

      // Mapping pour l'état du bouton Like
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
