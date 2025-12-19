import { HttpContext } from '@adonisjs/core/http'
import Post from '#models/post' 
import { DateTime } from 'luxon' 

/**
 * HomeController
 * Mengatur halaman utama sosial media (feed).
 */
export default class HomeController {
  
  /**
   * Menampilkan Feed Sosial Media
   * Mengambil postingan terbaru, menghitung like/komen, dan memformat data untuk tampilan.
   */
  async index({ view, auth }: HttpContext) {
    const userId = auth.user?.id

    // Query Utama: Ambil semua post
    const posts = await Post.query()
      .preload('user')          // Ambil data penulis post
      .withCount('likes')       // Hitung total like (disimpan di $extras.likes_count)
      .withCount('comments')    // Hitung total komentar (disimpan di $extras.comments_count)
      .preload('comments', (commentQuery) => {
        // Ambil 5 komentar terbaru beserta penulisnya untuk preview
        commentQuery.preload('user').orderBy('createdAt', 'desc').limit(5) 
      }) 
      .preload('likes', (query) => { 
        // Cek apakah user yang sedang login sudah me-like post ini
        if (userId) query.where('userId', userId) 
      })
      .orderBy('createdAt', 'desc') // Urutkan dari yang terbaru
      .limit(50)                    // Batasi 50 post agar ringan

    // Mapping Data: Format data mentah database menjadi objek siap pakai di View
    const finalPosts = posts.map(post => {
        const postObj = post.toJSON() 
        const createdAtLuxon = DateTime.fromISO(postObj.createdAt)
        
        // Pastikan nama user tersedia di object utama
        if (postObj.user && post.user) {
            postObj.user.fullName = post.user.fullName
        }

        // Mapping nama user untuk setiap komentar
        postObj.comments.forEach((commentObj: any, index: number) => {
            const originalComment = post.comments[index] 
            if (commentObj.user && originalComment.user) {
                commentObj.user.fullName = originalComment.user.fullName
            }
        })
        
        return {
            ...postObj, 
            // Boolean: Apakah user login sudah like post ini?
            isLikedByCurrentUser: post.likes && post.likes.length > 0,
            
            // Konversi count string ke Number (aman dari null)
            totalLikes: Number(post.$extras.likes_count ?? 0),
            totalComments: Number(post.$extras.comments_count ?? 0),
            
            // Waktu relatif (contoh: "5 minutes ago")
            relativeTime: createdAtLuxon.toRelative(), 
        }
    })

    return view.render('pages/social_media/home_socmed', {
      posts: finalPosts 
    })
  }
}