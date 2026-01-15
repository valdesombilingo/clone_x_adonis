import type { HttpContext } from '@adonisjs/core/http'

export default class HomeController {
  /**
   * Affichage 'home' (Fil d'actualité)
   */
  async index({ view, auth }: HttpContext) {
    const user = auth.user

    return view.render('pages/home', { user })
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
