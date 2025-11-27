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
  declare fullName: string

  @column.date()
  declare dateOfBirth: DateTime | null

  @column()
  declare bio: string | null

  @column()
  declare avatarUrl: string | null

  @column()
  declare bannerImage: string | null

  @column()
  declare location: string | null

  @column()
  declare websiteUrl: string | null

  // Champs de Sécurité / Fonctionnalités
  @column()
  declare isEmailVerified: boolean
  @column()
  declare isPrivate: boolean

  @column()
  declare emailVerificationToken: string | null

  @column.dateTime({ serializeAs: null })
  declare emailVerifiedAt: DateTime | null

  // Compteurs Dénormalisés
  @column()
  declare followersCount: number

  @column()
  declare followingCount: number

  // Champs de l'Horodatage
  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
