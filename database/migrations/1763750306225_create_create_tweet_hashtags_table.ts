import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'create_tweet_hashtags'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      // Clés étrangères (ON DELETE CASCADE)
      table
        .integer('tweet_id')
        .unsigned()
        .references('id')
        .inTable('tweets')
        .onDelete('CASCADE')
        .notNullable()
      table
        .integer('hashtag_id')
        .unsigned()
        .references('id')
        .inTable('hashtags')
        .onDelete('CASCADE')
        .notNullable()

      table.timestamp('created_at', { useTz: true }).notNullable()

      // Clé Primaire Composite
      table.primary(['tweet_id', 'hashtag_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
