// app/controllers/posts_controller.ts

import Post from '#models/post'
import { HttpContext } from '@adonisjs/core/http'
import fs from 'node:fs/promises' 
import app from '@adonisjs/core/services/app'

// Konstanta
const MAX_CONTENT_LENGTH = 500
const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2 Megabytes
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp']


export default class PostsController {
 
    async index({ response }: HttpContext) {
    const posts = await Post.query().preload('user').orderBy('createdAt', 'desc')
        return response.ok(posts)
    }

    /**
    * Membuat Post baru. (VALIDASI MANUAL + REDIRECT)
    */
    async store({ request, response, auth, session }: HttpContext) { // <-- TAMBAHKAN 'session'
    // 1. Ambil Input Mentah dan File
    const { content } = request.all()
    const imageFile = request.file('image', {
    size: MAX_FILE_SIZE,
    extnames: ALLOWED_EXTENSIONS,
    })

    // 2. VALIDASI MANUAL (Menggunakan session.flash dan redirect)
    if (!content && !imageFile) {
    session.flash('errors', [{ message: 'Konten atau Gambar wajib diisi.' }])
            session.flashExcept(['image'])
    return response.redirect().back()
    }

    if (content && (content.length < 1 || content.length > MAX_CONTENT_LENGTH)) {
        session.flash('errors', [{ message: `Konten harus kurang dari ${MAX_CONTENT_LENGTH} karakter.` }])
        session.flash('content', content)
        return response.redirect().back()
    }

    // 3. VALIDASI FILE (Menggunakan session.flash dan redirect)
    if (imageFile && !imageFile.isValid) {
        const errorMessages = imageFile.errors.map(err => ({ 
                message: `Gagal upload gambar: ${err.message}` 
            }))
        session.flash('errors', errorMessages) 
                session.flash('content', content)
        return response.redirect().back()
    }

    const userId = auth.user!.id 
    let imageFileName: string | null = null

    // 4. Logika Pemindahan File (Upload)
    if (imageFile) {
        // Buat folder 'uploads/posts' jika belum ada
        const uploadsPath = app.publicPath('uploads/posts')
        await fs.mkdir(uploadsPath, { recursive: true })

        // Generate nama file unik
        const newFileName = `${Date.now()}-${userId}.${imageFile.extname}`
        imageFileName = `uploads/posts/${newFileName}`

        // Pindahkan file ke folder publik
        await imageFile.move(uploadsPath, { name: newFileName })
    }

    // 5. Simpan Post baru ke database
    await Post.create({
        userId: userId,
        content: content,
        image: imageFileName, 
    })
    
    // 6. Redirect ke halaman feed dengan notifikasi sukses (PENTING!)
    session.flash('notification', 'Post Anda berhasil diunggah! 🪴')
        return response.redirect().toRoute('social.home') // <--- REDIRECT MENGGUNAKAN NAMA ROUTE
    }

    /**
    * Mengedit Post yang sudah ada. (Logika ini tetap mengembalikan JSON)
    */
    async update({ params, request, response, auth }: HttpContext) {
        // 1. Ambil Input Mentah dan File
        const { content } = request.all()
        const imageFile = request.file('image', {
        size: MAX_FILE_SIZE,
        extnames: ALLOWED_EXTENSIONS,
    })

    // 2. VALIDASI MANUAL
    if (content !== undefined && (content.length < 1 || content.length > MAX_CONTENT_LENGTH)) {
        return response.badRequest({ message: `Content must be between 1 and ${MAX_CONTENT_LENGTH} characters.` })
    }
    // 3. VALIDASI FILE
    if (imageFile && !imageFile.isValid) {
        return response.badRequest({ 
        message: 'File upload failed validation.', 
        errors: imageFile.errors 
    })
    }

    // 4. Cari Post
    const post = await Post.find(params.id)
    if (!post) {
        return response.notFound({ message: 'Post tidak ditemukan' })
    }

    // 5. Verifikasi Kepemilikan (Authorization)
    if (post.userId !== auth.user!.id) {
        return response.forbidden({ message: 'Anda tidak diizinkan mengedit post ini.' })
    }

    // 6. Logika Update Gambar (Hapus yang lama, simpan yang baru)
    let newImageFileName = post.image

    if (imageFile) {
    // A. Hapus gambar lama jika ada
    if (post.image) {
        const oldImagePath = app.publicPath(post.image)
        try {
            await fs.unlink(oldImagePath)
        } catch (err) {
            console.error(`Gagal menghapus file lama: ${err}`)
        }
    }
    
    // B. Upload gambar baru
    const userId = auth.user!.id
    const uploadsPath = app.publicPath('uploads/posts')
    const newFileName = `${Date.now()}-${userId}.${imageFile.extname}`
    newImageFileName = `uploads/posts/${newFileName}`

    await imageFile.move(uploadsPath, { name: newFileName })
    } else if (content === undefined && imageFile === undefined && post.image) {
    // Logika Hapus Gambar jika hanya content dan image yang tidak dikirim
    if (post.image) {
    const oldImagePath = app.publicPath(post.image)
    try {
        await fs.unlink(oldImagePath)
    } catch (err) {
        console.error(`Gagal menghapus file lama: ${err}`)
    }
    newImageFileName = null
    }
    }


    // 7. Update Post
    post.merge({
    content: content || post.content, // Gunakan content yang baru atau yang lama
    image: newImageFileName,
    })
    await post.save()

    await post.load('user')

    return response.ok({
        message: 'Post berhasil diperbarui',
        post: post,
        })
    }

    // Menghapus Post
    async destroy({ params, response, auth }: HttpContext) {
        // 1. Cari Post
        const post = await Post.find(params.id)
    if (!post) {
        return response.notFound({ message: 'Post tidak ditemukan' })
    }

    // 2. Verifikasi Kepemilikan (Authorization)
    if (post.userId !== auth.user!.id) {
        return response.forbidden({ message: 'Anda tidak diizinkan menghapus post ini.' })
    }

    // 3. Hapus Gambar dari Server sebelum hapus dari DB
    if (post.image) {
        const oldImagePath = app.publicPath(post.image)
    try {
        await fs.unlink(oldImagePath)
    } catch (err) {
        console.error(`Gagal menghapus file post: ${err}`)
    }
    }

    // 4. Hapus Post dari Database
    await post.delete()

    return response.noContent()
    }
}