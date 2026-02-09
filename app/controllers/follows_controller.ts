import type { HttpContext } from '@adonisjs/core/http'
import Follow from '#models/follow'
import User from '#models/user'

export default class FollowsController {
  // =========================================================================
  //  Affiche la liste des abonnés ou abonnements 'showFollow'
  // =========================================================================

  async showFollow({ params, request, view, auth, session }: HttpContext) {
    const authUser = auth.getUserOrFail()

    // 1. Récupérer l'utilisateur dont on regarde les relations
    const targetUser = await User.query().where('userName', params.username).firstOrFail()

    // 2. Définir l'onglet
    const tab = session.flashMessages.get('activeTab') || request.input('tab', 'followers')

    // 3. Construire la requête pour récupérer les utilisateurs de la liste
    const query = User.query()
      // Est-ce que le user (connecté) les suis ? Pour le bouton "Abonné"
      .preload('followers', (q) => q.where('followerId', authUser.id))
      // Est-ce qu'ILS ME suivent ? (Pour le texte "Suivre en retour")
      .preload('following', (q) => q.where('followingId', authUser.id))

    if (tab === 'following') {
      // Les gens que targetUser suit
      query.whereIn('id', (sub) => {
        sub.from('follows').select('following_id').where('follower_id', targetUser.id)
      })
    } else {
      // Les gens qui suivent targetUser
      query.whereIn('id', (sub) => {
        sub.from('follows').select('follower_id').where('following_id', targetUser.id)
      })
    }

    const users = await query

    // 4. Injecter les états dans $extras pour Edge
    users.forEach((u) => {
      u.$extras.isFollowing = u.followers.length > 0
      u.$extras.followsYou = u.following.length > 0
    })

    return view.render('pages/profiles/follow', {
      user: targetUser,
      users,
      tab,
    })
  }

  // =========================================================================
  //  Méthode Toggle (Suivre / Se désabonner) 'toggleFollow'
  // =========================================================================

  async toggleFollow({ auth, params, response, request }: HttpContext) {
    const follower = auth.getUserOrFail()
    const followingId = params.id

    // Sécurité : pas d'auto-follow
    if (follower.id === Number(followingId)) {
      return response.badRequest('Vous ne pouvez pas vous suivre vous-même.')
    }

    const existingFollow = await Follow.query()
      .where('followerId', follower.id)
      .where('followingId', followingId)
      .first()

    if (existingFollow) {
      await existingFollow.delete()
    } else {
      await Follow.create({
        followerId: follower.id,
        followingId: followingId,
        isAccepted: true,
      })
    }

    const queryParams = request.qs()

    // On redirige en réinjectant ces paramètres
    return response.redirect().withQs(queryParams).back()
  }
}
