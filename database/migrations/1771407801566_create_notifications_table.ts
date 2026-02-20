import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'notifications'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()

      table
        .integer('user_id')
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
        .notNullable()

      table
        .integer('notifier_id')
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
        .nullable()

      table
        .enum('type', [
          'LIKE',
          'RETWEET',
          'REPLY',
          'FOLLOW',
          'FOLLOW_REQUEST',
          'FOLLOW_ACCEPTED',
          'MENTION',
        ])
        .notNullable()

      table.timestamp('read_at', { useTz: true }).nullable()
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
