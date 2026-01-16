import { DateTime } from 'luxon'
import {
  BaseModel,
  column,
  belongsTo,
  hasMany,
  afterCreate,
  afterDelete,
} from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import User from '#models/user'

export default class Tweet extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare content: string | null

  @column()
  declare mediaUrl: string | null

  @column()
  declare parentId: number | null

  @column()
  declare retweetId: number | null

  // ==========================================================
  // Compteurs dénormalisés (valeurs par défaut à 0)
  // ==========================================================
  @column({ consume: (val) => val ?? 0 })
  declare repliesCount: number

  @column({ consume: (val) => val ?? 0 })
  declare retweetsCount: number

  @column({ consume: (val) => val ?? 0 })
  declare likesCount: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // ==========================================================
  // RELATIONS
  // ==========================================================

  // Un tweet appartient à un utilisateur
  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  // Si c'est une réponse, elle appartient à un tweet parent
  @belongsTo(() => Tweet, {
    foreignKey: 'parentId',
  })
  declare parent: BelongsTo<typeof Tweet>

  // Un tweet peut avoir plusieurs réponses
  @hasMany(() => Tweet, {
    foreignKey: 'parentId',
  })
  declare replies: HasMany<typeof Tweet>

  // Si c'est un retweet, il pointe vers le tweet original
  @belongsTo(() => Tweet, {
    foreignKey: 'retweetId',
  })
  declare originalTweet: BelongsTo<typeof Tweet>

  // Un tweet peut avoir plusieurs retweets
  @hasMany(() => Tweet, {
    foreignKey: 'retweetId',
  })
  declare retweets: HasMany<typeof Tweet>

  // ==========================================================
  // HOOKS Lucid pour gérer automatiquement les compteurs
  // ==========================================================

  // Incrémenter le compteur de réponses du parent
  @afterCreate()
  static async incrementParentReplies(tweet: Tweet) {
    if (tweet.parentId) {
      const parent = await Tweet.find(tweet.parentId)
      if (parent) {
        parent.repliesCount++
        await parent.save()
      }
    }
  }

  // Décrémenter le compteur de réponses du parent
  @afterDelete()
  static async decrementParentReplies(tweet: Tweet) {
    if (tweet.parentId) {
      const parent = await Tweet.find(tweet.parentId)
      if (parent && parent.repliesCount > 0) {
        parent.repliesCount--
        await parent.save()
      }
    }
  }

  // Incrémenter le compteur de retweets de l’original
  @afterCreate()
  static async incrementRetweets(tweet: Tweet) {
    if (tweet.retweetId) {
      const original = await Tweet.find(tweet.retweetId)
      if (original) {
        original.retweetsCount++
        await original.save()
      }
    }
  }

  // Décrémenter le compteur de retweets de l’original
  @afterDelete()
  static async decrementRetweets(tweet: Tweet) {
    if (tweet.retweetId) {
      const original = await Tweet.find(tweet.retweetId)
      if (original && original.retweetsCount > 0) {
        original.retweetsCount--
        await original.save()
      }
    }
  }
}
