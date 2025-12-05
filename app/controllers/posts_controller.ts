// app/controllers/posts_controller.ts

import Post from '#models/post'
import { HttpContext } from '@adonisjs/core/http'
import fs from 'node:fs/promises' 
import app from '@adonisjs/core/services/app'

const MAX_CONTENT_LENGTH = 500
const MAX_FILE_SIZE = 5 * 1024 * 1024 
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp']

export default class PostsController {
 
    async index({ response }: HttpContext) {
        const posts = await Post.query().preload('user').orderBy('createdAt', 'desc')
        return response.ok(posts)
    }

    async store({ request, response, auth, session }: HttpContext) {
        const { content } = request.all()
        const imageFile = request.file('image', {
            size: MAX_FILE_SIZE,
            extnames: ALLOWED_EXTENSIONS,
        })

        if (!content && !imageFile) {
            session.flash('notification', { type: 'error', message: 'Postingan tidak boleh kosong!' })
            return response.redirect().back()
        }

        if (content && content.length > MAX_CONTENT_LENGTH) {
            session.flash('notification', { type: 'error', message: 'Teks terlalu panjang.' })
            return response.redirect().back()
        }

        let imageFileName: string | null = null

        if (imageFile) {
            if (!imageFile.isValid) {
                session.flash('notification', { type: 'error', message: 'File gambar tidak valid.' })
                return response.redirect().back()
            }
            try {
                await fs.mkdir(app.publicPath('uploads/posts'), { recursive: true })
                const newFileName = `${Date.now()}-${auth.user!.id}.${imageFile.extname}`
                await imageFile.move(app.publicPath('uploads/posts'), { name: newFileName })
                imageFileName = `uploads/posts/${newFileName}`
            } catch (error) {
                session.flash('notification', { type: 'error', message: 'Gagal upload gambar.' })
                return response.redirect().back()
            }
        }

        await Post.create({
            userId: auth.user!.id,
            content: content,
            image: imageFileName, 
        })
        
        session.flash('notification', { type: 'success', message: 'Postingan berhasil diterbitkan!' })
        return response.redirect().back()
    }

    async update({ response }: HttpContext) {
        return response.redirect().back()
    }

    /**
    * Menghapus Post (SUDAH DIPERBAIKI)
    */
    async destroy({ params, response, auth, session }: HttpContext) {
        try {
            const post = await Post.find(params.id)
            
            if (!post) {
                session.flash('notification', { type: 'error', message: 'Post tidak ditemukan' })
                return response.redirect('/profile')
            }

            if (post.userId !== auth.user!.id) {
                session.flash('notification', { type: 'error', message: 'Dilarang menghapus post orang lain' })
                return response.redirect('/profile')
            }

            // 1. HAPUS RELASI DULU (Manual Cascade)
            // Ini yang bikin error "Kesalahan Sistem" sebelumnya
            await post.related('likes').query().delete()
            await post.related('comments').query().delete()

            // 2. Hapus File Fisik
            if (post.image) {
                try { await fs.unlink(app.publicPath(post.image)) } catch (e) {}
            }

            // 3. Hapus Post Database
            await post.delete()
            
            session.flash('notification', { type: 'success', message: 'Post berhasil dihapus.' })
            return response.redirect('/profile') // Redirect aman

        } catch (error) {
            // Tampilkan error asli di terminal untuk debugging
            console.error('Delete Error:', error)
            
            session.flash('notification', { type: 'error', message: 'Gagal menghapus post. Cek terminal server.' })
            return response.redirect('/profile')
        }
    }
}