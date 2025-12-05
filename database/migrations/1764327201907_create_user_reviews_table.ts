import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'user_reviews'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      
      // Relasi ke User (Siapa yang review)
      table.integer('user_id').unsigned().references('users.id').notNullable()
      
      // [DIUBAH] Relasi ke Product (Barang apa yang direview)
      // Sebelumnya: ordered_product_id
      // Sekarang: product_id (agar seeder dummy bisa jalan tanpa harus buat order dulu)
      table.integer('product_id').unsigned().references('products.id').notNullable()
      
      table.integer('rating').unsigned().notNullable()
      table.text('comment').nullable()
      
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}