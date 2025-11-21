import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'create_follows'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()

      // Clés étrangères vers USERS (ON DELETE CASCADE)
      table
        .integer('follower_id')
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
        .notNullable()
        .comment('Utilisateur qui suit')
      table
        .integer('following_id')
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
        .notNullable()
        .comment('Utilisateur qui est suivi')

      table
        .boolean('is_accepted')
        .notNullable()
        .defaultTo(true)
        .comment('Requis pour les comptes privés')

      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).nullable()

      // Contrainte unique: un seul suivi entre deux utilisateurs
      table.unique(['follower_id', 'following_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
