import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'user_profiles'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.integer('user_id').unsigned().references('users.id').notNullable()

      table.string('full_name').references('users.full_name')
      table.string('username').notNullable().defaultTo('')
      table.string('email',254).references('users.email').unique().notNullable()

      table.string('profile_picture',512).nullable()
      table.text('bio').notNullable().defaultTo('')

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}