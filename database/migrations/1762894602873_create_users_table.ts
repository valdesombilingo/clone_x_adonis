import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()

      // Champs d'authentification de base
      table.string('email', 255).notNullable().unique()
      table.string('password', 255).notNullable()
      table.string('username', 50).notNullable().unique().comment('@utilisateur')
      table.string('full_name', 100).notNullable()
      table.date('date_of_birth').nullable()

      // Champs de profil
      table.text('bio').nullable()
      table.string('avatar_url', 255).nullable()
      table.string('banner_image', 255).nullable()
      table.string('location', 100).nullable()
      table.string('website_url', 255).nullable()

      // Champs de sécurité / fonctionnalités
      table
        .boolean('is_verified')
        .notNullable()
        .defaultTo(false)
        .comment('Pour la confirmation d’email')
      table.boolean('is_private').notNullable().defaultTo(false).comment('Compte privé')
      table.string('remember_me_token').nullable().comment('Token pour la session longue durée')

      // Compteurs dénormalisés
      table.integer('followers_count').notNullable().defaultTo(0)
      table.integer('following_count').notNullable().defaultTo(0)

      // Champs de l'horodatage
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
