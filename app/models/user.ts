import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import PasswordReset from '#models/password_reset'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true })
  declare id: number

  // --- Champs d'Authentification ---
  @column()
  declare email: string

  @column({ serializeAs: null })
  declare password: string

  @column()
  declare userName: string

  // --- Champs de Profil ---
  @column()
  declare fullName: string

  @column.date()
  declare dateOfBirth: DateTime | null

  @column()
  declare bio: string | null

  @column()
  declare avatarUrl: string | null

  get avatar() {
    return this.avatarUrl || '/images/backgrounds/default-profile-avatar.png'
  }

  @column()
  declare bannerImage: string | null

  @column()
  declare location: string | null

  @column()
  declare websiteUrl: string | null

  // --- Champs de Sécurité ---
  @column()
  declare isEmailVerified: boolean

  @column()
  declare emailVerificationToken: string | null

  @column.dateTime({ serializeAs: null })
  declare emailTokenExpiresAt: DateTime | null

  @column.dateTime({ serializeAs: null })
  declare emailVerifiedAt: DateTime | null

  @column({ serializeAs: null })
  declare rememberMeToken: string | null

  @column()
  declare isPrivate: boolean

  // --- Compteurs Dénormalisés ---
  @column()
  declare followersCount: number

  @column()
  declare followingCount: number

  // --- Champs de l'Horodatage ---
  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Définition de la relation à l'intérieur de la classe
  @hasMany(() => PasswordReset)
  declare passwordResets: HasMany<typeof PasswordReset>
}
