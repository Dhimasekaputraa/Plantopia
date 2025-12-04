import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'

// Import model User. Pastikan path ini sesuai dengan struktur folder Anda.
import User from '#models/user'
import Like from '#models/like'
import Comment from '#models/comment'

export default class Post extends BaseModel {
  protected static fillable = ['userId', 'image', 'content']

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number // Kunci asing ke tabel users

  @column()
  declare image: string | null // string buat store url

  @column()
  declare content: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
  

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
  
  @hasMany(() => Like)
  declare likes: HasMany<typeof Like>

  @hasMany(() => Comment)
  declare comments: HasMany<typeof Comment>
  
}