import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, belongsTo } from '@adonisjs/lucid/orm'
import type { HasMany, BelongsTo } from '@adonisjs/lucid/types/relations'
import ProductItem from '#models/product_item'
import ProductCategory from '#models/product_category'
import User from '#models/user'

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
  declare image: string | null // Menyimpan path gambar

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relasi
  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => ProductCategory)
  declare category: BelongsTo<typeof ProductCategory>

  @hasMany(() => ProductItem)
  declare items: HasMany<typeof ProductItem>
}