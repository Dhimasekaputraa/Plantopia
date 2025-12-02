import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
// Nanti kita buat model ini saat fitur checkout
// import OrderStatus from '#models/order_status' 
// import PaymentMethod from '#models/payment_method'

export default class ShopOrder extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare paymentMethodId: number

  @column()
  declare shippingMethodId: number

  @column()
  declare orderStatusId: number

  @column()
  declare orderTotal: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relasi
  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  // Contoh relasi lain (bisa di-uncomment nanti jika modelnya sudah dibuat)
  /*
  @belongsTo(() => OrderStatus)
  declare status: BelongsTo<typeof OrderStatus>
  
  @hasMany(() => OrderedProduct)
  declare items: HasMany<typeof OrderedProduct>
  */
}