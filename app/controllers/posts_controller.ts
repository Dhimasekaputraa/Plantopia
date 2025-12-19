import Post from '#models/post'
import { HttpContext } from '@adonisjs/core/http'
import fs from 'node:fs/promises' 
import app from '@adonisjs/core/services/app'

// Konfigurasi Upload & Konten
const MAX_CONTENT_LENGTH = 500
const MAX_FILE_SIZE = 5 * 1024 * 1024 
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp']

export default class PostsController {
 
    /**
     * Tampilkan semua postingan (terbaru di atas)
     */
    async index({ response }: HttpContext) {
        const posts = await Post.query().preload('user').orderBy('createdAt', 'desc')
        return response.ok(posts)
    }

    /**
     * Simpan postingan baru
     * Handle validasi teks dan upload gambar.
     */
    async store({ request, response, auth, session }: HttpContext) {
        const { content } = request.all()
        const imageFile = request.file('image', {
            size: MAX_FILE_SIZE,
            extnames: ALLOWED_EXTENSIONS,
        })

        // Validasi: Harus ada konten atau gambar
        if (!content && !imageFile) {
            session.flash('notification', { type: 'error', message: 'Postingan tidak boleh kosong!' })
            return response.redirect().back()
        }

        // Validasi: Panjang karakter
        if (content && content.length > MAX_CONTENT_LENGTH) {
            session.flash('notification', { type: 'error', message: 'Teks terlalu panjang.' })
            return response.redirect().back()
        }

        let imageFileName: string | null = null

        // Proses upload gambar jika ada
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

        // Simpan ke database
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
     * Hapus Postingan
     * Termasuk hapus relasi (likes/comments) dan file fisik gambar.
     */
    async destroy({ params, response, auth, session }: HttpContext) {
        try {
            const post = await Post.find(params.id)
            
            // Cek keberadaan post
            if (!post) {
                session.flash('notification', { type: 'error', message: 'Post tidak ditemukan' })
                return response.redirect('/profile')
            }

            // Cek kepemilikan (Authorization)
            if (post.userId !== auth.user!.id) {
                session.flash('notification', { type: 'error', message: 'Dilarang menghapus post orang lain' })
                return response.redirect('/profile')
            }

            // 1. Hapus Relasi (Manual Cascade)
            // Mencegah error foreign key
            await post.related('likes').query().delete()
            await post.related('comments').query().delete()

            // 2. Hapus File Fisik Gambar
            if (post.image) {
                try { await fs.unlink(app.publicPath(post.image)) } catch (e) {}
            }

            // 3. Hapus Data Utama
            await post.delete()
            
            session.flash('notification', { type: 'success', message: 'Post berhasil dihapus.' })
            return response.redirect('/profile')

        } catch (error) {
            console.error('Delete Error:', error)
            session.flash('notification', { type: 'error', message: 'Gagal menghapus post. Cek terminal server.' })
            return response.redirect('/profile')
        }
    }
}