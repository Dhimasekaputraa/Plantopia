import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import Product from '#models/product'

export default class ProductCategory extends BaseModel {
  // Nama tabel di database (jika tidak default 'product_categories')
  // public static table = 'product_categories' 

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare categoryName: string  // Pastikan ini sesuai dengan nama kolom di migrasi database Anda

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relasi: Satu kategori punya banyak produk
  @hasMany(() => Product)
  declare products: HasMany<typeof Product>
}