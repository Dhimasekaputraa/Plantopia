import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'product'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.integer('product_category_id').unsigned().references('product_category.id').notNullable()
      table.string('name').notNullable()
      table.text('description').notNullable().defaultTo('')
      table.string('product_image').notNullable().unique() //store image url, kalo ada tipe data yang lebih cocok ganti aja
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}