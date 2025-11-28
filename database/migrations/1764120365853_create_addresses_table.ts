import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'addresses'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.integer('user_id').unsigned()
      table.integer('unit_number').unsigned().notNullable()
      table.string('street').notNullable()
      table.string('city').notNullable()
      table.string('region').nullable()
      table.integer('country_id').unsigned().references('countries.id').notNullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}