import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Country from '#models/country'

export default class Address extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare unitNumber: string | null

  @column()
  declare street: string

  @column()
  declare city: string

  @column()
  declare region: string

  @column()
  declare countryId: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relationship
  @belongsTo(() => Country)
  declare country: BelongsTo<typeof Country>

  // Helper method
  get fullAddress() {
    const parts = []
    if (this.unitNumber) parts.push(this.unitNumber)
    parts.push(this.street)
    parts.push(this.city)
    parts.push(this.region)
    return parts.join(', ')
  }
}