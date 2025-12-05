import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'shop_orders'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.integer('user_id').unsigned().references('users.id').notNullable()
      
      // 1. ADDRESS ID: Tetap WAJIB (notNullable) karena ambil dari Profil
      table.integer('address_id').unsigned().references('addresses.id').notNullable()
      
      // 2. PAYMENT METHOD: Ubah jadi NULLABLE (Boleh kosong untuk COD)
      table.integer('user_payment_method_id').unsigned().references('user_payment_methods.id').nullable()
      
      table.integer('shipping_method_id').unsigned().references('shipping_methods.id').notNullable()
      table.integer('order_status_id').unsigned().references('order_statuses.id').notNullable()
      table.dateTime('order_date').notNullable()
      table.integer('order_total').unsigned().notNullable()

      // 3. SNAPSHOT ALAMAT (Teks): Simpan copy alamat saat beli
      table.text('delivery_address').notNullable() 
      
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}