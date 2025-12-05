import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import Address from '#models/address' // Pastikan import ini ada
import OrderedProduct from '#models/ordered_product'

export default class ShopOrder extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare addressId: number // Wajib

  @column()
  declare userPaymentMethodId: number | null // Boleh Null

  @column()
  declare shippingMethodId: number

  @column()
  declare orderStatusId: number

  @column()
  declare orderTotal: number

  @column()
  declare deliveryAddress: string // Snapshot Teks

  @column.dateTime()
  declare orderDate: DateTime

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relasi
  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => Address)
  declare address: BelongsTo<typeof Address>

  @hasMany(() => OrderedProduct)
  declare items: HasMany<typeof OrderedProduct>
}