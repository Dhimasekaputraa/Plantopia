import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // Ubah full_name menjadi first_name dan last_name
      table.dropColumn('full_name')
      table.string('first_name', 100).notNullable().after('id')
      table.string('last_name', 100).notNullable().after('first_name')
      
      // Tambah field baru
      table.string('phone_numbers', 20).nullable().after('email')
      table.string('profile_picture', 255).nullable().after('password')
      table.text('bio').nullable().after('profile_picture')
      
      // Verification timestamps
      table.timestamp('email_verified_at').nullable().after('bio')
      table.timestamp('phone_verified_at').nullable().after('email_verified_at')
      
      // Status & tracking
      table.boolean('is_active').defaultTo(true).after('phone_verified_at')
      table.timestamp('last_login_at').nullable().after('is_active')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      // Rollback changes
      table.string('full_name').nullable()
      table.dropColumn('first_name')
      table.dropColumn('last_name')
      table.dropColumn('phone_numbers')
      table.dropColumn('profile_picture')
      table.dropColumn('bio')
      table.dropColumn('email_verified_at')
      table.dropColumn('phone_verified_at')
      table.dropColumn('is_active')
      table.dropColumn('last_login_at')
    })
  }
}