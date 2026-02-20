import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import Tweet from '#models/tweet'

export default class Notification extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare notifierId: number

  @column()
  declare tweetId: number | null

  @column()
  declare type:
    | 'LIKE'
    | 'RETWEET'
    | 'REPLY'
    | 'FOLLOW'
    | 'FOLLOW_REQUEST'
    | 'FOLLOW_ACCEPTED'
    | 'MENTION'

  @column.dateTime()
  declare readAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // ==========================================================
  // RELATIONS
  // ==========================================================

  @belongsTo(() => User, { foreignKey: 'userId' })
  declare user: BelongsTo<typeof User>

  @belongsTo(() => User, { foreignKey: 'notifierId' })
  declare notifier: BelongsTo<typeof User>

  @belongsTo(() => Tweet)
  declare tweet: BelongsTo<typeof Tweet>
}
