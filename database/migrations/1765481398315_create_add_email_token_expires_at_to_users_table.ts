import { BaseSchema } from '@adonisjs/lucid/schema'

export default class AddEmailTokenExpiresAtToUsers extends BaseSchema {
  protected tableName = 'users'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.timestamp('email_token_expires_at', { useTz: true }).nullable()
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('email_token_expires_at')
    })
  }
}
