// app/controllers/posts_controller.ts

import Post from '#models/post'
import { HttpContext } from '@adonisjs/core/http'
import fs from 'node:fs/promises' 
import app from '@adonisjs/core/services/app'

// Konstanta
const MAX_CONTENT_LENGTH = 500
const MAX_FILE_SIZE = 5 * 1024 * 1024 // Saya naikkan jadi 5MB agar lebih aman
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp']

export default class PostsController {
 
    // Menampilkan Feed (JSON - jika diakses langsung)
    async index({ response }: HttpContext) {
        const posts = await Post.query().preload('user').orderBy('createdAt', 'desc')
        return response.ok(posts)
    }

    /**
    * Membuat Post baru. 
    * PERBAIKAN: Menggunakan flash 'notification' agar error muncul di Layout Market.
    */
    async store({ request, response, auth, session }: HttpContext) {
        // 1. Ambil Input
        const { content } = request.all()
        const imageFile = request.file('image', {
            size: MAX_FILE_SIZE,
            extnames: ALLOWED_EXTENSIONS,
        })

        // 2. VALIDASI: Pastikan ada Konten ATAU Gambar
        if (!content && !imageFile) {
            session.flash('notification', {
                type: 'error',
                message: 'Postingan tidak boleh kosong! Tulis sesuatu atau upload foto.'
            })
            return response.redirect().back()
        }

        // 3. VALIDASI: Panjang Konten
        if (content && content.length > MAX_CONTENT_LENGTH) {
            session.flash('notification', {
                type: 'error',
                message: `Teks terlalu panjang (Maks ${MAX_CONTENT_LENGTH} karakter).`
            })
            session.flash('content', content) // Kembalikan teks biar ga ngetik ulang
            return response.redirect().back()
        }

        // 4. VALIDASI FILE GAMBAR
        if (imageFile) {
            if (!imageFile.isValid) {
                // Ambil pesan error pertama dari validator Adonis
                const errorMsg = imageFile.errors[0]?.message || 'File tidak valid'
                
                session.flash('notification', {
                    type: 'error',
                    message: `Gagal upload gambar: ${errorMsg}`
                })
                session.flash('content', content)
                return response.redirect().back()
            }
        }

        const userId = auth.user!.id 
        let imageFileName: string | null = null

        // 5. PROSES UPLOAD
        if (imageFile) {
            try {
                // Buat folder 'public/uploads/posts' jika belum ada
                const uploadsPath = app.publicPath('uploads/posts')
                await fs.mkdir(uploadsPath, { recursive: true })

                // Generate nama file unik (timestamp-userid.ext)
                const newFileName = `${Date.now()}-${userId}.${imageFile.extname}`
                
                // Pindahkan file
                await imageFile.move(uploadsPath, { name: newFileName })

                // Simpan path relatif untuk database
                imageFileName = `uploads/posts/${newFileName}`
            } catch (error) {
                console.error(error)
                session.flash('notification', {
                    type: 'error',
                    message: 'Terjadi kesalahan sistem saat menyimpan gambar.'
                })
                return response.redirect().back()
            }
        }

        // 6. SIMPAN KE DATABASE
        await Post.create({
            userId: userId,
            content: content,
            image: imageFileName, 
        })
        
        // 7. BERHASIL
        session.flash('notification', {
            type: 'success',
            message: 'Postingan berhasil diterbitkan! 🌱'
        })
        
        return response.redirect().toRoute('social.home')
    }

    /**
    * Mengedit Post (Logika JSON untuk API/Edit)
    */
    async update({ params, request, response, auth }: HttpContext) {
        const { content } = request.all()
        const imageFile = request.file('image', {
            size: MAX_FILE_SIZE,
            extnames: ALLOWED_EXTENSIONS,
        })

        // Validasi Sederhana
        if (content && content.length > MAX_CONTENT_LENGTH) {
            return response.badRequest({ message: 'Konten terlalu panjang' })
        }
        if (imageFile && !imageFile.isValid) {
            return response.badRequest({ message: 'File tidak valid', errors: imageFile.errors })
        }

        const post = await Post.find(params.id)
        if (!post) return response.notFound({ message: 'Post tidak ditemukan' })

        if (post.userId !== auth.user!.id) {
            return response.forbidden({ message: 'Anda bukan pemilik post ini' })
        }

        let newImageFileName = post.image

        // Logika Ganti Gambar
        if (imageFile) {
            // Hapus gambar lama
            if (post.image) {
                try { await fs.unlink(app.publicPath(post.image)) } catch (e) {}
            }
            
            // Upload gambar baru
            const uploadsPath = app.publicPath('uploads/posts')
            const newFileName = `${Date.now()}-${auth.user!.id}.${imageFile.extname}`
            await imageFile.move(uploadsPath, { name: newFileName })
            newImageFileName = `uploads/posts/${newFileName}`
        }

        post.merge({ content: content || post.content, image: newImageFileName })
        await post.save()

        return response.ok({ message: 'Update berhasil', post })
    }

    /**
    * Menghapus Post
    */
    async destroy({ params, response, auth }: HttpContext) {
        const post = await Post.find(params.id)
        if (!post) return response.notFound({ message: 'Post tidak ditemukan' })

        if (post.userId !== auth.user!.id) {
            return response.forbidden({ message: 'Dilarang menghapus post orang lain' })
        }

        // Hapus file fisik jika ada
        if (post.image) {
            try { await fs.unlink(app.publicPath(post.image)) } catch (e) {}
        }

        await post.delete()
        return response.noContent()
    }
}