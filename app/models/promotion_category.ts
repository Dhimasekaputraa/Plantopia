import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import ProductCategory from '#models/product_category'
import Promotion from '#models/promotion'

export default class PromotionCategory extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare productCategoryId: number

  @column()
  declare promotionId: number

  @column()
  declare name: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => ProductCategory)
  declare productCategory: BelongsTo<typeof ProductCategory>

  @belongsTo(() => Promotion)
  declare promotion: BelongsTo<typeof Promotion>
}
