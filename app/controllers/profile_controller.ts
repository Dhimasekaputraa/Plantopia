// app/controllers/profile_controller.ts

import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import Post from '#models/post'
import Product from '#models/product'
import UserAddress from '#models/user_address'
import hash from '@adonisjs/core/services/hash'
import app from '@adonisjs/core/services/app'
import fs from 'node:fs/promises'

export default class ProfileController {
  
  /**
   * Menampilkan Halaman Profil Utama
   * Memuat data User, Posts, Products, dan Alamat
   */
  async show({ view, auth }: HttpContext) {
    const user = auth.user!

    // 1. Ambil Postingan User (Urutkan dari terbaru)
    const posts = await Post.query()
        .where('userId', user.id)
        .orderBy('createdAt', 'desc')
        .preload('user')
        .preload('likes')
        .preload('comments')

    // 2. Ambil Produk User (Urutkan dari terbaru)
    const products = await Product.query()
        .where('userId', user.id)
        .orderBy('createdAt', 'desc')
        .preload('items') // Untuk menampilkan harga

    // 3. Ambil Alamat (Untuk ditampilkan di dashboard)
    const userAddresses = await UserAddress.query()
        .where('userId', user.id)
        .preload('address', (q) => q.preload('country'))

    return view.render('pages/profile/profile', { 
        user, 
        posts, 
        products,
        userAddresses 
    })
  }

  /**
   * Menampilkan Halaman Pengaturan (Settings)
   */
  async settings({ view, auth }: HttpContext) {
    const user = auth.user!
    
    // Ambil data negara & alamat untuk form
    // (Asumsi Anda punya model Country, jika tidak, bisa dihapus bagian ini)
    const countries = await import('#models/country').then(mod => mod.default.all())
    
    const userAddresses = await UserAddress.query()
      .where('userId', user.id)
      .preload('address', (q) => q.preload('country'))

    return view.render('pages/profile/settings', { 
      user,
      countries, 
      userAddresses 
    })
  }

  /**
   * Update Profil (Nama, Bio, Foto)
   */
  async update({ request, auth, response, session }: HttpContext) {
    const user = auth.user!
    const { firstName, lastName, phoneNumbers, bio } = request.only(['firstName', 'lastName', 'phoneNumbers', 'bio'])
    const avatar = request.file('avatar', {
      size: '2mb',
      extnames: ['jpg', 'png', 'jpeg', 'webp']
    })

    // Update Text Data
    user.merge({ firstName, lastName, phoneNumbers, bio })

    // Update Avatar jika ada
    if (avatar) {
      if (!avatar.isValid) {
        session.flash('errors', avatar.errors)
        return response.redirect().back()
      }

      // Hapus avatar lama jika ada
      if (user.profilePicture) {
        try {
          await fs.unlink(app.publicPath(user.profilePicture))
        } catch (error) {
          // Ignore error jika file lama tidak ketemu
        }
      }

      // Simpan avatar baru
      await avatar.move(app.publicPath('uploads/avatars'), {
        name: `${user.id}_${new Date().getTime()}.${avatar.extname}`
      })
      
      user.profilePicture = `uploads/avatars/${avatar.fileName}`
    }

    await user.save()
    session.flash('success', 'Profile updated successfully!')
    return response.redirect().back()
  }

  /**
   * Ganti Password
   */
  async changePassword({ request, auth, response, session }: HttpContext) {
    const user = auth.user!
    const { currentPassword, newPassword, newPasswordConfirmation } = request.all()

    // 1. Validasi Password Lama
    const isValid = await hash.verify(user.password, currentPassword)
    if (!isValid) {
      session.flash('error', 'Current password is incorrect')
      return response.redirect().back()
    }

    // 2. Validasi Konfirmasi
    if (newPassword !== newPasswordConfirmation) {
      session.flash('error', 'New password confirmation does not match')
      return response.redirect().back()
    }

    // 3. Simpan Password Baru
    user.password = newPassword
    await user.save()

    session.flash('success', 'Password changed successfully')
    return response.redirect().back()
  }

  /**
   * Hapus Akun Permanen
   */
  async delete({ request, auth, response, session }: HttpContext) {
    const user = auth.user!
    const { password } = request.all()

    // Verifikasi password sebelum hapus
    const isValid = await hash.verify(user.password, password)
    if (!isValid) {
      session.flash('error', 'Incorrect password. Account deletion cancelled.')
      return response.redirect().back()
    }

    // Hapus User
    await user.delete()
    await auth.use('web').logout()

    return response.redirect('/')
  }

  /**
   * Toggle Seller Mode (Opsional - Jika masih dibutuhkan logika backendnya)
   * Tapi di tampilan sudah kita hilangkan tombolnya.
   */
  async toggleSellerMode({ auth, response }: HttpContext) {
    const user = auth.user!
    user.isSeller = !user.isSeller
    await user.save()
    return response.redirect().back()
  }

  // --- ADDRESS MANAGEMENT ---

  async addAddress({ request, auth, response }: HttpContext) {
    const user = auth.user!
    const data = request.only(['unitNumber', 'street', 'city', 'region', 'countryId'])
    
    // 1. Buat Address Baru
    const Address = (await import('#models/address')).default
    const address = await Address.create(data)

    // 2. Hubungkan ke User (UserAddress)
    await UserAddress.create({
      userId: user.id,
      addressId: address.id,
      isDefault: false // Default false dulu
    })

    return response.redirect().back()
  }

  async deleteAddress({ params, response }: HttpContext) {
    const userAddress = await UserAddress.findOrFail(params.id)
    await userAddress.delete()
    return response.redirect().back()
  }

  async setDefaultAddress({ auth, params, response }: HttpContext) {
    const user = auth.user!
    
    // Reset semua jadi false
    await UserAddress.query().where('userId', user.id).update({ isDefault: false })
    
    // Set yang dipilih jadi true
    const target = await UserAddress.findOrFail(params.id)
    target.isDefault = true
    await target.save()

    return response.redirect().back()
  }
}