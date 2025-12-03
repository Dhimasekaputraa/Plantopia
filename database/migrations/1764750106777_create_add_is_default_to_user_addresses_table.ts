import {BaseSchema} from '@adonisjs/lucid/schema'

export default class AddIsDefaultToUserAddresses extends BaseSchema {
  protected tableName = 'user_addresses'

  public async up () {
    this.schema.table(this.tableName, (table) => {
      table.boolean('is_default').notNullable().defaultTo(false)
    })
  }

  public async down () {
    this.schema.table(this.tableName, (table) => {
      table.dropColumn('is_default')
    })
  }
}
