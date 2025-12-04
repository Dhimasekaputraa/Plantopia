// app/controllers/like_controller.ts

import { HttpContext } from '@adonisjs/core/http'
import Like from '#models/like'
import Post from '#models/post'

export default class LikesController {
  /**
   * Method untuk men-toggle status like (Like atau Unlike)
   * URL yang akan digunakan: POST /posts/:postId/like
   */
  async toggleLike({ params, auth, response }: HttpContext) {
    // 1. Ambil ID Post dari parameter route
    const postId = params.postId // Sesuaikan dengan nama parameter di route Anda
    const userId = auth.user!.id // Ambil ID User yang sedang login

    // 2. Verifikasi keberadaan Post
    const post = await Post.find(postId)
    if (!post) {
      return response.notFound({ message: 'Postingan tidak ditemukan.' })
    }

    // 3. Cek apakah user sudah memberikan like pada post ini
    const existingLike = await Like.query()
      .where('userId', userId)
      .where('postId', postId)
      .first()

    // 4. Logika Toggle
    let isLiked: boolean
    let totalLikes: number

    if (existingLike) {
      // Jika Like sudah ada, HAPUS (Unlike)
      await existingLike.delete()
      isLiked = false
    } else {
      // Jika Like belum ada, BUAT Like baru
      await Like.create({
        userId: userId,
        postId: postId,
      })
      isLiked = true
    }

    // 5. Hitung ulang total likes untuk post ini
    const updatedPost = await Post.query()
      .where('id', postId)
      .withCount('likes') // Menggunakan relasi likes yang sudah Anda buat di Post.ts
      .firstOrFail()
      
    // Ambil jumlah likes dari kolom relasi yang dihitung
    totalLikes = updatedPost.$extras.likes_count as number
    
    // 6. Kirim respons JSON untuk AJAX
    return response.ok({ 
        message: isLiked ? 'Like berhasil ditambahkan.' : 'Like berhasil dihapus (Unlike).',
        postId: postId,
        isLiked: isLiked,
        totalLikes: totalLikes 
    })
  }
}