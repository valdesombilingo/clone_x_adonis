import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.alterTable('users', (table) => {
      // 1. Renommage du champ is_verified en is_email_verified
      table.renameColumn('is_verified', 'is_email_verified')

      // 2. Ajout des nouveaux champs de vérification d'email
      table.string('email_verification_token', 255).nullable()
      table.timestamp('email_verified_at', { useTz: true }).nullable()
    })
  }

  async down() {
    this.schema.alterTable('users', (table) => {
      table.dropColumn('email_verification_token')
      table.dropColumn('email_verified_at')
      table.renameColumn('is_email_verified', 'is_verified')
    })
  }
}
