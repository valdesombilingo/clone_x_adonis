import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import PasswordReset from '#models/password_reset'
import Tweet from '#models/tweet'
import Follow from '#models/follow'

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

  get banner() {
    return this.bannerImage || '/images/backgrounds/defaut-profile-banner.png'
  }

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
  @column({ consume: (val) => val ?? 0 })
  declare followersCount: number

  @column({ consume: (val) => val ?? 0 })
  declare followingCount: number

  // --- Champs de l'Horodatage ---
  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Définition de la relation à l'intérieur de la classe
  @hasMany(() => PasswordReset)
  declare passwordResets: HasMany<typeof PasswordReset>

  @hasMany(() => Tweet)
  declare tweets: HasMany<typeof Tweet>

  // les comptes que l’utilisateur suit
  @hasMany(() => Follow, {
    foreignKey: 'followerId',
  })
  declare following: HasMany<typeof Follow>

  // les comptes qui suivent l’utilisateur
  @hasMany(() => Follow, {
    foreignKey: 'followingId',
  })
  declare followers: HasMany<typeof Follow>

  // ==========================================================
  // MÉTHODES STATIQUES
  // ==========================================================

  // Génération d'un slug de base à partir du nom complet
  static createBaseUsername(fullName: string): string {
    return fullName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '')
  }

  // Garantit un 'username' unique en ajoutant un suffixe numérique si nécessaire
  static async generateUniqueUsername(
    baseUsername: string,
    currentUserId?: number
  ): Promise<string> {
    let username = baseUsername
    let suffix = 0
    while (true) {
      const query = this.query().where('userName', username)
      if (currentUserId) query.whereNot('id', currentUserId)

      const existingUser = await query.first()
      if (!existingUser) return username

      suffix++
      username = `${baseUsername}${suffix}`
    }
  }
}
