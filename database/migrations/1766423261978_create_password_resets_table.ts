import { BaseSchema } from '@adonisjs/lucid/schema'

export default class PasswordResets extends BaseSchema {
  protected tableName = 'password_resets'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('user_id')
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
        .notNullable()

      table.string('token', 255).notNullable().unique()
      table.timestamp('created_at').notNullable().defaultTo(this.now())
      table.timestamp('expires_at').notNullable()
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
