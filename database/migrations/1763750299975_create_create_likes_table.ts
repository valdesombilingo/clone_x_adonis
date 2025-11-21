import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'create_likes'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()

      // Clés étrangères (ON DELETE CASCADE)
      table
        .integer('user_id')
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
        .notNullable()
      table
        .integer('tweet_id')
        .unsigned()
        .references('id')
        .inTable('tweets')
        .onDelete('CASCADE')
        .notNullable()

      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).nullable()

      // Contrainte unique: un utilisateur ne peut liker qu'une fois un tweet
      table.unique(['user_id', 'tweet_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
