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
    const follower = await User.find(follow.followerId)
    const following = await User.find(follow.followingId)

    if (follower) {
      follower.followingCount = (follower.followingCount ?? 0) + 1
      await follower.save()
    }

    if (following) {
      following.followersCount = (following.followersCount ?? 0) + 1
      await following.save()
    }
  }

  @afterDelete()
  static async decrementCounters(follow: Follow) {
    const follower = await User.find(follow.followerId)
    const following = await User.find(follow.followingId)

    if (follower && follower.followingCount > 0) {
      follower.followingCount--
      await follower.save()
    }

    if (following && following.followersCount > 0) {
      following.followersCount--
      await following.save()
    }
  }
}
