import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import ShoppingCart from '#models/shopping_cart'
import ProductItem from '#models/product_item'

export default class ShoppingCartItem extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare shoppingCartId: number

  @column()
  declare productItemId: number

  @column()
  declare quantity: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relasi
  @belongsTo(() => ShoppingCart)
  declare shoppingCart: BelongsTo<typeof ShoppingCart>

  @belongsTo(() => ProductItem)
  declare productItem: BelongsTo<typeof ProductItem>
}