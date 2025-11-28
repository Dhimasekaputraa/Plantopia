import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'promotions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable
      table.string('name').notNullable()
      table.text('description').notNullable().defaultTo('')
      table.decimal('discount',3,2).defaultTo(0).notNullable
      table.timestamp('start_date').notNullable()
      table.timestamp('end_date').notNullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}