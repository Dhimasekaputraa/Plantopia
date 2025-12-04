import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, column, hasMany, computed } from '@adonisjs/lucid/orm' // <--- (1) Tambah hasMany
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import type { HasMany } from '@adonisjs/lucid/types/relations' // <--- (2) Tambah ini
import Product from '#models/product' // <--- (3) Tambah ini
import Post from '#models/post'
import Comment from '#models/comment' // <--- (4) Tambah ini
import Like from '#models/like'       // <--- (5) Tambah ini

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

  @column({ columnName: 'full_name' }) 
  declare fullNameDb: string | null

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

  // --- RELASI: User punya banyak Post ---
  @hasMany(() => Post)
  declare posts: HasMany<typeof Post>

  // Seorang User memiliki banyak Comment
  @hasMany(() => Comment)
  declare comments: HasMany<typeof Comment>

  // Seorang User memberikan banyak Like
  @hasMany(() => Like)
  declare likes: HasMany<typeof Like>

  @computed()
  get fullName() {
    // 1. Prioritaskan nilai dari kolom 'full_name' di DB
    if (this.fullNameDb) {
      return this.fullNameDb 
    }
    // 2. Fallback jika kolom 'full_name' null/kosong, gabungkan firstName dan lastName
    if (this.firstName && this.lastName) {
      return `${this.firstName} ${this.lastName}`
    }
    
    return 'Anonymous User' 
  }
  
}