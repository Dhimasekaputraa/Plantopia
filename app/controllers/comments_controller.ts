// app/controllers/comments_controller.ts

import Comment from '#models/comment'
import Post from '#models/post' // Diperlukan untuk validasi keberadaan post
import { HttpContext } from '@adonisjs/core/http'

export default class CommentsController {
  
  /**
   * Menyimpan komentar baru pada sebuah post (POST /comments).
   */
  async store({ request, response, auth }: HttpContext) {
    
    // 1. Verifikasi Login (Guard)
    if (!auth.user) {
      return response.unauthorized({ message: 'Anda harus login untuk berkomentar.' })
    }

    // 2. Ambil Input
    const { postId, content } = request.only(['postId', 'content'])

    // 3. Validasi Input Dasar
    if (!postId || !content || content.trim().length === 0) {
      return response.badRequest({ message: 'Post ID dan konten komentar wajib diisi.' })
    }
    
    // 4. Verifikasi Post
    const post = await Post.find(postId)
    if (!post) {
        return response.notFound({ message: 'Postingan yang dikomentari tidak ditemukan.' })
    }

    try {
      // 5. Buat Komentar
      const comment = await Comment.create({
        userId: auth.user.id,
        postId: postId,
        content: content.trim(),
      })
      
      // 6. Muat relasi User untuk ditampilkan di UI/AJAX response
      // Ini penting agar front-end bisa langsung menampilkan nama user
      await comment.load('user') 
      
      // 7. Kirim Respons Sukses
      return response.created({ 
        message: 'Komentar berhasil ditambahkan.',
        comment: comment.toJSON(), // Kirim objek komentar yang sudah diisi relasi user
      })
      
    } catch (error) {
      console.error('Error saat menyimpan komentar:', error)
      return response.internalServerError({ message: 'Gagal menyimpan komentar akibat kesalahan server.' })
    }
  }
}