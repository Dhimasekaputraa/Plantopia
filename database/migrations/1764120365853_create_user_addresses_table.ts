import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'user_addresses'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.integer('user_id').unsigned().references('users.id').notNullable()
      table.integer('address_id').unsigned().references('addresses.id').notNullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}