import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'

export default class Block extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare blockerId: number

  @column()
  declare blockedId: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @belongsTo(() => User, { foreignKey: 'blockedId' })
  declare blockedUser: BelongsTo<typeof User>
}
