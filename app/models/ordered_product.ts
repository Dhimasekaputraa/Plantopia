import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import ShopOrder from '#models/shop_order'
import ProductItem from '#models/product_item'

export default class OrderedProduct extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare shopOrderId: number

  @column()
  declare productItemId: number

  @column()
  declare quantity: number

  @column()
  declare price: number // Harga saat dibeli (penting jika harga barang berubah nanti)

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relasi
  @belongsTo(() => ShopOrder)
  declare order: BelongsTo<typeof ShopOrder>

  @belongsTo(() => ProductItem)
  declare productItem: BelongsTo<typeof ProductItem>
}