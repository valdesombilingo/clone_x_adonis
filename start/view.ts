// start/view.ts
import edge from 'edge.js'
import { linkifyText } from '#services/linkify_service'
import Notification from '#models/notification'

// Helper

edge.global('linkify', (text: string) => {
  if (!text) return ''
  return linkifyText(text)
})

edge.global('hasUnreadNotifications', async (userId: number | undefined) => {
  if (!userId) return false

  const notification = await Notification.query()
    .where('userId', userId)
    .whereNull('readAt')
    .first()

  return !!notification
})
