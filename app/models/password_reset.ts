import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'

export default class PasswordReset extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column({ serializeAs: null })
  declare token: string

  /**
   * Date de création : Remplie automatiquement par Adonis
   */
  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  /**
   * Date d'expiration : Pas d'auto-décorateur ici !
   * Elle sera calculée manuellement dans votre contrôleur.
   */
  @column.dateTime()
  declare expiresAt: DateTime

  /**
   * Relation avec l'utilisateur
   */
  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}
