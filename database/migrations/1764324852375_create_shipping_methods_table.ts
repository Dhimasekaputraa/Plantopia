import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'shipping_methods'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      
      // [PASTIKAN KOLOM INI ADA]
      table.string('name').notNullable()
      table.integer('price').notNullable()
      table.string('estimated_days').notNullable() // Snake_case untuk database

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}