import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'user_payment_methods'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.integer('user_id').unsigned().references('users.id').notNullable()
      table.integer('payment_type').unsigned().references('payment_types.id').notNullable()
      table.string('account_number').notNullable()
      table.dateTime('expiry_date').notNullable()
      table.timestamp('created_at').notNullable
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}