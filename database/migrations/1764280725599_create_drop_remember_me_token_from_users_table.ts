import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // Supprime la colonne 'remember_me_token'
      table.dropColumn('remember_me_token')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('remember_me_token', 100).nullable()
    })
  }
}
