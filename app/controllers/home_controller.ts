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
        const postObj = post.toJSON() 
        const createdAtLuxon = DateTime.fromISO(postObj.createdAt)
        
        // *** PERBAIKAN NAMA USER: Pastikan fullName terbawa ***
        if (postObj.user && post.user) {
            // Ambil fullName dari getter Model dan masukkan ke object JSON
            postObj.user.fullName = post.user.fullName
        }
        // ******************************************************
        
        return {
            ...postObj, 
            isLikedByCurrentUser: post.likes.length > 0,
            totalLikes: post.$extras.likes_count,
            relativeTime: createdAtLuxon.toRelative(), 
        }
    })

    return view.render('pages/social_media/home_socmed', {
      posts: finalPosts 
    })
  }
}