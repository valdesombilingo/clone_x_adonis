import type { HttpContext } from '@adonisjs/core/http'
import Tweet from '#models/tweet'

export default class HomeController {
  /**
   * Affichage 'home' (Fil d'actualité)
   */
  async index({ view, request, auth }: HttpContext) {
    // 1. Récupérer l'utilisateur (on s'assure qu'il est connecté)
    const user = auth.getUserOrFail()

    // 2. Récupérer les paramètres de pagination et d'onglet
    const page = request.input('page', 1)
    const tab = request.input('tab', 'for-you') // 'for-you' est l'onglet par défaut

    // 3. Préparer la requête de base
    const tweetsQuery = Tweet.query().preload('user').orderBy('createdAt', 'desc')

    // 4. Appliquer le filtre si on est sur l'onglet "Abonnements"
    if (tab === 'following') {
      tweetsQuery.whereIn('userId', (query) => {
        query.from('follows').select('following_id').where('follower_id', user.id)
      })
    }

    // 5. limitation
    const tweets = await tweetsQuery.limit(50)

    // 6. Envoyer tout à la vue d'un coup
    return view.render('pages/home', {
      tweets,
      tab,
      user,
    })
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
