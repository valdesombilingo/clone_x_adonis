import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, column } from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true })
  declare id: number

  // Champs d'Authentification
  @column()
  declare email: string

  @column({ serializeAs: null })
  declare password: string

  @column()
  declare username: string

  // Champs de Profil
  @column()
  declare full_name: string

  @column.date()
  declare date_of_birth: DateTime | null

  @column()
  declare bio: string | null

  @column()
  declare avatar_url: string | null

  @column()
  declare banner_image: string | null

  @column()
  declare location: string | null

  @column()
  declare website_url: string | null

  // Champs de Sécurité / Fonctionnalités
  @column()
  declare is_verified: boolean

  @column()
  declare is_private: boolean

  @column({ serializeAs: null })
  declare remember_me_token: string | null

  // Compteurs Dénormalisés
  @column()
  declare followers_count: number

  @column()
  declare following_count: number

  // Champs de l'Horodatage
  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
