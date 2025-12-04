import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany, computed } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import ProductCategory from '#models/product_category'
import ProductItem from '#models/product_item'
import UserReview from '#models/user_review'

export default class Product extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare productCategoryId: number

  @column()
  declare name: string

  @column()
  declare description: string | null

  @column()
  declare image: string | null

  @column()
  declare soldCount: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // --- RELASI ---
  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => ProductCategory)
  declare category: BelongsTo<typeof ProductCategory>

  @hasMany(() => ProductItem)
  declare items: HasMany<typeof ProductItem>

  @hasMany(() => UserReview)
  declare reviews: HasMany<typeof UserReview>

  // --- COMPUTED PROPERTIES (LOGIKA TAMPILAN) ---

  // 1. Hitung Rata-rata Rating (Angka, misal: 4.5)
  @computed()
  get averageRating() {
    if (!this.reviews || this.reviews.length === 0) {
      return 0
    }
    const total = this.reviews.reduce((sum, review) => sum + review.rating, 0)
    return parseFloat((total / this.reviews.length).toFixed(1))
  }

  // 2. Array Bintang Penuh (Untuk Looping di View)
  // Contoh: Jika rating 4, return [0, 0, 0, 0]
  @computed()
  get starsFilled() {
    const count = Math.round(this.averageRating)
    return new Array(count).fill(0)
  }

  // 3. Array Bintang Kosong (Sisa)
  // Contoh: Jika rating 4, sisa 1 -> return [0]
  @computed()
  get starsEmpty() {
    const count = Math.round(this.averageRating)
    return new Array(5 - count).fill(0)
  }

  // 4. Jumlah Review
  @computed()
  get reviewCount() {
    return this.reviews ? this.reviews.length : 0
  }
}