import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'tweets'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()

      // Clé étrangère vers USERS (ON DELETE CASCADE)
      table
        .integer('user_id')
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
        .notNullable()

      table.text('content').nullable()
      table.string('media_url', 255).nullable()

      // Auto-Références (Réponse et Retweet)
      table
        .integer('parent_id')
        .unsigned()
        .references('id')
        .inTable('tweets')
        .onDelete('CASCADE')
        .nullable()
        .comment('Réponse à un autre tweet.')
      table
        .integer('retweet_id')
        .unsigned()
        .references('id')
        .inTable('tweets')
        .onDelete('SET NULL')
        .nullable()
        .comment("Retweet d'un autre tweet.")

      // Compteurs dénormalisés
      table.integer('replies_count').notNullable().defaultTo(0)
      table.integer('retweets_count').notNullable().defaultTo(0)
      table.integer('likes_count').notNullable().defaultTo(0)

      // Champs de l'horodatage
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
