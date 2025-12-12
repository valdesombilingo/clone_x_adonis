import type { HttpContext } from '@adonisjs/core/http'

/**
 * NOTE: Ce Controller Affiche la page d'accueil (le fil d'actualité) après qu'un
 * utilisateur se soit connecté avec succès et ait vérifié son e-mail.
 */

export default class HomeController {
  // =========================================================================
  // Affichage 'home'
  // =========================================================================

  async index({ view, auth }: HttpContext) {
    // Accès à l'utilisateur authentifié
    const user = auth.user

    // Rendre la vue et passer les données
    return view.render('pages/home', {
      user: user,
    })
  }
}
