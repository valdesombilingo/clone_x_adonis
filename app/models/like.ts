import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, afterCreate, afterDelete } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import Tweet from '#models/tweet'
import Notification from '#models/notification'

export default class Like extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare tweetId: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  // ==========================================================
  // RELATIONS
  // ==========================================================

  // Un like appartient à un utilisateur
  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  // Un like appartient à un tweet
  @belongsTo(() => Tweet)
  declare tweet: BelongsTo<typeof Tweet>

  // ==========================================================
  // HOOKS Lucid pour gérer automatiquement le compteur likesCount
  // ==========================================================

  @afterCreate()
  static async incrementLikes(like: Like) {
    await Tweet.query().where('id', like.tweetId).increment('likes_count', 1)

    const tweet = await Tweet.find(like.tweetId)

    if (tweet && tweet.userId !== like.userId) {
      await Notification.create({
        userId: tweet.userId,
        notifierId: like.userId,
        tweetId: tweet.id,
        type: 'LIKE',
      })
    }
  }

  @afterDelete()
  static async decrementLikes(like: Like) {
    await Tweet.query()
      .where('id', like.tweetId)
      .where('likes_count', '>', 0)
      .decrement('likes_count', 1)

    await Notification.query()
      .where('notifierId', like.userId)
      .where('tweetId', like.tweetId)
      .where('type', 'LIKE')
      .delete()
  }
}
