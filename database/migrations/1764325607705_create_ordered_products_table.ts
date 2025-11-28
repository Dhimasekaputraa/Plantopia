import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'ordered_products'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.integer('product_item_id').unsigned().references('product_items.id').notNullable()
      table.integer('shop_order_id').unsigned().references('shop_orders.id').notNullable()
      table.integer('quantity').unsigned().notNullable()
      table.integer('price').unsigned().notNullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}