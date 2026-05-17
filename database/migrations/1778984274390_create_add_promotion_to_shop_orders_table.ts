import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'shop_orders'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('promotion_id').unsigned().references('promotions.id').nullable().onDelete('SET NULL')
      table.integer('discount_amount').unsigned().defaultTo(0).notNullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('promotion_id')
      table.dropColumn('discount_amount')
    })
  }
}