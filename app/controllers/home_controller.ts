// app/controllers/home_controller.ts

import { HttpContext } from '@adonisjs/core/http'
import Post from '#models/post' 
import { DateTime } from 'luxon' 

export default class HomeController {
  
  async index({ view, auth }: HttpContext) {
    const userId = auth.user?.id

    const posts = await Post.query()
      .preload('user')
      .withCount('likes')     // Menghitung jumlah like -> $extras.likes_count
      .withCount('comments')  // Menghitung jumlah komen -> $extras.comments_count
      .preload('comments', (commentQuery) => {
        commentQuery.preload('user').orderBy('createdAt', 'desc').limit(5) 
      }) 
      .preload('likes', (query) => { 
        if (userId) query.where('userId', userId) // Cek like user sendiri
      })
      .orderBy('createdAt', 'desc')
      .limit(50) 

    const finalPosts = posts.map(post => {
        const postObj = post.toJSON() 
        const createdAtLuxon = DateTime.fromISO(postObj.createdAt)
        
        if (postObj.user && post.user) {
            postObj.user.fullName = post.user.fullName
        }

        postObj.comments.forEach((commentObj: any, index: number) => {
            const originalComment = post.comments[index] 
            if (commentObj.user && originalComment.user) {
                commentObj.user.fullName = originalComment.user.fullName
            }
        })
        
        return {
            ...postObj, 
            isLikedByCurrentUser: post.likes && post.likes.length > 0,
            
            // [FIX] Pastikan dikonversi ke Number. Jika null/undefined jadi 0.
            totalLikes: Number(post.$extras.likes_count ?? 0),
            totalComments: Number(post.$extras.comments_count ?? 0),
            
            relativeTime: createdAtLuxon.toRelative(), 
        }
    })

    return view.render('pages/social_media/home_socmed', {
      posts: finalPosts 
    })
  }
}