// app/controllers/notifications_controller.ts
import type { HttpContext } from '@adonisjs/core/http'
import Notification from '#models/notification'
import { DateTime } from 'luxon'

/**
 * Contrôleur de Notifications :
 * - Affiche la page de notifications (ShowNotification)
 * - Supprimer une notification (destroyNotification)
 */
export default class NotificationsController {
  // =========================================================================
  // Afficher la liste des notifications 'ShowNotification'
  // =========================================================================

  async ShowNotification({ auth, view }: HttpContext) {
    const user = auth.getUserOrFail()

    // 1. Récupérer les notifications pour l'affichage
    const notifications = await Notification.query()
      .where('userId', user.id)
      .preload('notifier')
      .preload('tweet', (q) => q.preload('user'))
      .orderBy('createdAt', 'desc')
      .limit(100)

    // 2. Marquer les notifications non lues comme lues d'un coup
    await Notification.query()
      .where('userId', user.id)
      .whereNull('readAt')
      .update({ readAt: DateTime.now() })

    return view.render('pages/notification', { notifications })
  }

  // =========================================================================
  // Supprimer une notification 'destroyNotification'
  // =========================================================================
  async destroyNotification({ auth, params, response, session }: HttpContext) {
    const user = auth.getUserOrFail()
    const notification = await Notification.query()
      .where('id', params.id)
      .where('userId', user.id)
      .firstOrFail()

    await notification.delete()

    session.flash('success', 'Notification supprimée.')
    return response.redirect().back()
  }
}
