import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm' // <--- (1) Tambah hasMany
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import type { HasMany } from '@adonisjs/lucid/types/relations' // <--- (2) Tambah ini
import Product from '#models/product' // <--- (3) Tambah ini

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare firstName: string

  @column()
  declare lastName: string

  @column()
  declare email: string

  @column()
  declare phoneNumbers: string | null

  @column({ serializeAs: null })
  declare password: string

  @column()
  declare profilePicture: string | null

  @column()
  declare bio: string | null

  @column()
  declare isSeller: boolean

  @column.dateTime()
  declare emailVerifiedAt: DateTime | null

  @column.dateTime()
  declare phoneVerifiedAt: DateTime | null

  @column()
  declare isActive: boolean

  @column.dateTime()
  declare lastLoginAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  // --- RELASI: User punya banyak Product ---
  @hasMany(() => Product)
  declare products: HasMany<typeof Product>
  // ----------------------------------------

  get fullName() {
    return `${this.firstName} ${this.lastName}`
  }
}