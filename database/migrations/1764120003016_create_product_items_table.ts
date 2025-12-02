import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'product_items'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      
      // Relasi ke Products (Perhatikan: 'products' pakai 's')
      table.integer('product_id').unsigned().references('id').inTable('products').onDelete('CASCADE')
      
      table.string('sku').notNullable()
      table.integer('qty_in_stock').notNullable().defaultTo(0)
      
      // Kolom Harga
      table.decimal('price', 12, 2).notNullable() 

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}