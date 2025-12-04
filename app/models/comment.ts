// app/models/comment.ts

import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

import User from '#models/user'
import Post from '#models/post'

export default class Comment extends BaseModel {
  @column({ isPrimary: true })
  declare id: number // ID Komentar

  @column()
  declare postId: number // Kunci asing ke posts.id

  @column()
  declare userId: number // Kunci asing ke users.id

  @column()
  declare content: string // Konten komentar (berdasarkan skema DB)

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  // Relasi: Sebuah Komentar dimiliki oleh satu Post
  @belongsTo(() => Post)
  declare post: BelongsTo<typeof Post>

  // Relasi: Sebuah Komentar dimiliki oleh satu User
  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}