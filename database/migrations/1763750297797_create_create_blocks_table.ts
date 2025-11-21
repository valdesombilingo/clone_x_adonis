import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'create_blocks'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()

      // Clés étrangères vers USERS (ON DELETE CASCADE)
      table
        .integer('blocker_id')
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
        .notNullable()
        .comment('Utilisateur qui effectue le blocage')

      table
        .integer('blocked_id')
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
        .notNullable()
        .comment('Utilisateur qui est bloqué')

      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).nullable()

      // Contrainte unique
      table.unique(['blocker_id', 'blocked_id'])
    })

    this.schema.alterTable(this.tableName, (table) => {
      // Ajouter un index pour optimiser la recherche rapide (Ex: Est-ce que User X bloque User Y?)
      table.index(['blocker_id', 'blocked_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
