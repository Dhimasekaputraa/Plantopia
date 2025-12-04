// app/Models/Like.ts
import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

// Impor Model User dan Post
import User from '#models/user'
import Post from '#models/post'

export default class Like extends BaseModel {
  // Nama tabel di database
  static table = 'likes'

  @column({ isPrimary: true })
  declare id: number

  // Kunci asing ke Post
  @column()
  declare postId: number

  // Kunci asing ke User
  @column()
  declare userId: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  // --- RELASI ---
  
  /**
   * Sebuah Like dimiliki oleh satu Post (Many-to-One)
   */
  @belongsTo(() => Post)
  declare post: BelongsTo<typeof Post>

  /**
   * Sebuah Like dimiliki oleh satu User (Many-to-One)
   */
  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}