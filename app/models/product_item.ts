import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Product from '#models/product'

export default class ProductItem extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare productId: number

  @column()
  declare sku: string

  @column()
  declare qtyInStock: number

  @column()
  declare price: number

  @belongsTo(() => Product)
  declare product: BelongsTo<typeof Product>
}