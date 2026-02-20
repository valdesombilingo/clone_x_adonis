// app/models/follow.ts
import { BaseModel, column, belongsTo, afterCreate, afterDelete } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import User from '#models/user'

export default class Follow extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  // utilisateur qui suit
  @column()
  declare followerId: number

  // utilisateur qui est suivi
  @column()
  declare followingId: number

  // utile pour les comptes privés
  @column()
  declare isAccepted: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  // ==========================================================
  // RELATIONS
  // ==========================================================

  // Relation vers l’utilisateur qui suit
  @belongsTo(() => User, {
    foreignKey: 'followerId',
  })
  declare follower: BelongsTo<typeof User>

  // Relation vers l’utilisateur qui est suivi
  @belongsTo(() => User, {
    foreignKey: 'followingId',
  })
  declare following: BelongsTo<typeof User>

  // ==========================================================
  // HOOKS Lucid pour gérer automatiquement les compteurs
  // ==========================================================

  @afterCreate()
  static async incrementCounters(follow: Follow) {
    if (follow.isAccepted) {
      await User.query().where('id', follow.followerId).increment('following_count', 1)
      await User.query().where('id', follow.followingId).increment('followers_count', 1)
    }
  }

  @afterDelete()
  static async decrementCounters(follow: Follow) {
    if (follow.isAccepted) {
      await User.query()
        .where('id', follow.followerId)
        .where('following_count', '>', 0)
        .decrement('following_count', 1)

      await User.query()
        .where('id', follow.followingId)
        .where('followers_count', '>', 0)
        .decrement('followers_count', 1)
    }
  }
}
