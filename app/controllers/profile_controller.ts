import type { HttpContext } from '@adonisjs/core/http'
import hash from '@adonisjs/core/services/hash'
import vine from '@vinejs/vine'
// import User from '#models/user' // Tidak wajib di-import jika kita pakai auth.user, tapi boleh ada.

export default class ProfileController {
  /**
   * 1. Show user profile (DENGAN DATA PRODUK)
   */
  async show({ auth, view }: HttpContext) {
    const user = auth.user!

    // PRELOAD: Ambil data produk milik user ini dari database
    // Kita urutkan dari yang paling baru (desc) dan ambil info harganya (items)
    await user.load('products', (query) => {
      query.orderBy('createdAt', 'desc').preload('items')
    })

    return view.render('pages/profile/profile', { user })
  }

  /**
   * 2. Show settings page
   */
  async settings({ view }: HttpContext) {
    return view.render('pages/profile/settings')
  }

  /**
   * 3. Update profile information
   */
  async update({ auth, request, response, session }: HttpContext) {
    try {
      const schema = vine.object({
        firstName: vine.string().trim().minLength(2).maxLength(100),
        lastName: vine.string().trim().minLength(2).maxLength(100),
        phoneNumbers: vine.string().trim().optional(),
        bio: vine.string().trim().maxLength(500).optional(),
      })

      const validator = vine.compile(schema)
      const data = await request.validateUsing(validator)

      const user = auth.user!
      user.firstName = data.firstName
      user.lastName = data.lastName
      user.phoneNumbers = data.phoneNumbers ?? null
      user.bio = data.bio ?? null
      
      // Jika ada upload foto profil, tambahkan logika di sini (opsional)
      // const image = request.file('avatar') ...
      
      await user.save()

      session.flash('success', 'Profile updated successfully!')
      return response.redirect().back()
    } catch (error) {
      if (error.messages) {
        session.flash('errors', error.messages)
      } else {
        session.flash('error', 'Failed to update profile')
      }
      return response.redirect().back()
    }
  }

  /**
   * 4. Change password
   */
  async changePassword({ auth, request, response, session }: HttpContext) {
    try {
      const schema = vine.object({
        currentPassword: vine.string(),
        newPassword: vine.string().minLength(8).maxLength(32),
        newPasswordConfirmation: vine.string().sameAs('newPassword'),
      })

      const validator = vine.compile(schema)
      const data = await request.validateUsing(validator)

      const user = auth.user!

      // Verify current password
      const isValid = await hash.verify(user.password, data.currentPassword)
      if (!isValid) {
        session.flash('error', 'Current password is incorrect')
        return response.redirect().back()
      }

      // Update password
      user.password = data.newPassword
      await user.save()

      session.flash('success', 'Password changed successfully!')
      return response.redirect().back()
    } catch (error) {
      if (error.messages) {
        session.flash('errors', error.messages)
      } else {
        session.flash('error', 'Failed to change password')
      }
      return response.redirect().back()
    }
  }

  /**
   * 5. Delete account
   */
  async delete({ auth, request, response, session }: HttpContext) {
    try {
      const { password } = request.only(['password'])
      const user = auth.user!

      // Verify password
      const isValid = await hash.verify(user.password, password)
      if (!isValid) {
        session.flash('error', 'Incorrect password')
        return response.redirect().back()
      }

      // Delete user
      await user.delete()

      // Logout
      await auth.use('web').logout()

      session.flash('success', 'Account deleted successfully')
      return response.redirect('/')
    } catch (error) {
      session.flash('error', 'Failed to delete account')
      return response.redirect().back()
    }
  }

  /**
   * 6. FITUR BARU: Toggle Seller Mode
   */
  async toggleSellerMode({ auth, response, session }: HttpContext) {
    const user = auth.user!
    
    // Ubah status (True <-> False)
    user.isSeller = !user.isSeller
    await user.save()

    const status = user.isSeller ? 'Activated (Seller)' : 'Deactivated (Buyer)'
    
    session.flash('success', `Seller Mode ${status}`)
    return response.redirect().back()
  }
}