import type { HttpContext } from '@adonisjs/core/http'
import Follow from '#models/follow'
import User from '#models/user'
import Notification from '#models/notification'
import db from '@adonisjs/lucid/services/db'

export default class FollowsController {
  /**
   * Contrôleur de follow :
   * - Affichage liste des abonnés ou abonnements (showFollow)
   * - Méthode Toggle (Suivre / Se désabonner) (toggleFollow)
   * - Accepter ou Annulé une demande d'abonnement 'acceptFollow' et 'rejectFollow'
   */
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
      .preload('followers', (q) => q.where('followerId', authUser.id))
      .preload('following', (q) => q.where('followingId', authUser.id))
      .select('*')
      .select(
        db.raw(
          '(SELECT EXISTS (SELECT 1 FROM blocks WHERE blocker_id = ? AND blocked_id = users.id)) as i_blocked_him',
          [authUser.id]
        )
      )
      .select(
        db.raw(
          '(SELECT EXISTS (SELECT 1 FROM blocks WHERE blocker_id = users.id AND blocked_id = ?)) as he_blocked_me',
          [authUser.id]
        )
      )

    if (tab === 'following') {
      // Les gens que targetUser suit
      query.whereIn('id', (sub) => {
        sub.from('follows').select('following_id').where('follower_id', targetUser.id)
      })
    } else {
      // Les gens qui suivent targetUser
      query.whereIn('id', (sub) => {
        sub
          .from('follows')
          .select('follower_id')
          .where('following_id', targetUser.id)
          .where('is_accepted', true)
      })
    }

    const users = await query

    // 4. Injecter les états dans $extras pour Edge
    users.forEach((u) => {
      const followEntry = u.followers.length > 0 ? u.followers[0] : null

      u.$extras.isFollowing = !!followEntry
      u.$extras.isFollowAccepted = followEntry ? followEntry.isAccepted : false
      u.$extras.followsYou = u.following.length > 0

      u.$extras.iBlockedHim = Boolean(u.$extras.i_blocked_him)
      u.$extras.heBlockedMe = Boolean(u.$extras.he_blocked_me)
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
    const targetUser = await User.findOrFail(params.id)

    const existingFollow = await Follow.query()
      .where('followerId', follower.id)
      .where('followingId', targetUser.id)
      .first()

    if (existingFollow) {
      // ANNULATION PAR L'EXPÉDITEUR
      await existingFollow.delete()
      // Supprime la notification chez le destinataire
      await Notification.query()
        .where('notifierId', follower.id)
        .where('userId', targetUser.id)
        .whereIn('type', ['FOLLOW', 'FOLLOW_REQUEST'])
        .delete()
    } else {
      // ENVOI DE LA DEMANDE
      const isAccepted = !targetUser.isPrivate
      await Follow.create({ followerId: follower.id, followingId: targetUser.id, isAccepted })

      await Notification.create({
        userId: targetUser.id,
        notifierId: follower.id,
        type: isAccepted ? 'FOLLOW' : 'FOLLOW_REQUEST',
      })
    }
    return response.redirect().withQs(request.qs()).back()
  }

  // ===================================================================================
  //  Méthode Accepter ou Annulé une demande d'abonnement 'acceptFollow'et 'rejectFollow'
  // ===================================================================================

  // Accepter la demande
  async acceptFollow({ auth, params, response }: HttpContext) {
    const user = auth.getUserOrFail()

    const follow = await Follow.query()
      .where('followerId', params.id)
      .where('followingId', user.id)
      .firstOrFail()

    follow.isAccepted = true
    await follow.save()

    await User.query().where('id', follow.followerId).increment('following_count', 1)
    await User.query().where('id', follow.followingId).increment('followers_count', 1)

    // 1. Ssupprime la notification de demande chez le destinataire
    await Notification.query()
      .where('notifierId', params.id)
      .where('userId', user.id)
      .where('type', 'FOLLOW_REQUEST')
      .delete()

    // 2. Crée une notification pour l'expéditeur
    await Notification.create({
      userId: params.id,
      notifierId: user.id,
      type: 'FOLLOW_ACCEPTED',
    })

    return response.redirect().back()
  }

  // Refuser la demande
  async rejectFollow({ auth, params, response }: HttpContext) {
    const user = auth.getUserOrFail()

    // Supprime le lien
    await Follow.query().where('followerId', params.id).where('followingId', user.id).delete()

    // Supprime la notification de demande chez nous (le destinataire)
    await Notification.query()
      .where('notifierId', params.id)
      .where('userId', user.id)
      .where('type', 'FOLLOW_REQUEST')
      .delete()

    return response.redirect().back()
  }
}
