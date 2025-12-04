// app/controllers/home_controller.ts

import { HttpContext } from '@adonisjs/core/http'
import Post from '#models/post' 
import { DateTime } from 'luxon' 

export default class HomeController {
  
  async index({ view, auth }: HttpContext) {
    const userId = auth.user?.id

    const posts = await Post.query()
      .preload('user')
      .withCount('likes')
      .withCount('comments')
      .preload('comments', (commentQuery) => {
        // Load 5 komentar terbaru + user-nya
        commentQuery.preload('user').orderBy('createdAt', 'desc').limit(5) 
      }) 
      .preload('likes', (query) => { 
        if (userId) {
          query.where('userId', userId)
        } else {
          query.where('userId', -1) 
        }
      })
      .orderBy('createdAt', 'desc')
      .limit(20) 

    const finalPosts = posts.map(post => {
        // Ambil objek JSON mentah
        const postObj = post.toJSON() 
        const createdAtLuxon = DateTime.fromISO(postObj.createdAt)
        
        // 🟢 KRUSIAL 1: Memaksa `fullName` pada user Post
        if (postObj.user && post.user) {
            // Ambil fullName dari getter Model dan masukkan ke object JSON
            postObj.user.fullName = post.user.fullName
        }

        // 🟢 KRUSIAL 2: Memaksa `fullName` pada setiap User Komentar
        // PERBAIKAN: Menambahkan Type Annotation (commentObj: any, index: number)
        postObj.comments.forEach((commentObj: any, index: number) => {
            // Akses Model Komentar asli untuk mendapatkan Model User yang sudah di-preload
            const originalComment = post.comments[index] 
            if (commentObj.user && originalComment.user) {
                // Ambil fullName dari getter Model User dan masukkan ke objek JSON Komentar
                commentObj.user.fullName = originalComment.user.fullName
            }
        })
        
        return {
            ...postObj, 
            isLikedByCurrentUser: post.likes.length > 0,
            totalLikes: post.$extras.likes_count,
            totalComments: post.$extras.comments_count,
            relativeTime: createdAtLuxon.toRelative(), 
        }
    })

    return view.render('pages/social_media/home_socmed', {
      posts: finalPosts 
    })
  }
}