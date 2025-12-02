import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'products'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      
      // Relasi ke User (Penjual)
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
      
      // Relasi ke Kategori
      table.integer('product_category_id').unsigned().references('id').inTable('product_categories').onDelete('CASCADE')
      
      table.string('name').notNullable()
      table.text('description').nullable()
      
      // Kolom Gambar
      table.string('image').nullable() 

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}