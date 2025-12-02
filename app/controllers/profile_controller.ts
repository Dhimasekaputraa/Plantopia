import type { HttpContext } from '@adonisjs/core/http'
import hash from '@adonisjs/core/services/hash'
import vine from '@vinejs/vine'
import app from '@adonisjs/core/services/app'
import { cuid } from '@adonisjs/core/helpers'

export default class ProfileController {
  /**
   * Show user profile
   */
  async show({ auth, view }: HttpContext) {
    const user = auth.user!
    
    // Load produk user untuk ditampilkan di profil
    await user.load('products', (query) => {
      query.orderBy('createdAt', 'desc').preload('items')
    })

    return view.render('pages/profile/profile', { user })
  }

  /**
   * Show settings page
   */
  async settings({ view }: HttpContext) {
    return view.render('pages/profile/settings')
  }

  /**
   * Update profile information (TERMASUK FOTO)
   */
  async update({ auth, request, response, session }: HttpContext) {
    try {
      // 1. Validasi Input Data Teks
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

      // 2. LOGIKA UPLOAD FOTO PROFIL (BARU)
      const avatar = request.file('avatar', {
        size: '2mb',
        extnames: ['jpg', 'png', 'jpeg', 'webp'],
      })

      if (avatar) {
        if (!avatar.isValid) {
          session.flash('error', 'Invalid image file (Max 2MB, JPG/PNG only)')
          return response.redirect().back()
        }

        // Simpan file dengan nama acak
        const fileName = `${cuid()}.${avatar.extname}`
        await avatar.move(app.makePath('resources/uploads/avatars'), {
          name: fileName
        })

        // Simpan path ke database
        user.profilePicture = `resources/uploads/avatars/${fileName}`
      }
      
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
   * Change password
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
   * Delete account
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
   * Toggle Seller Mode
   */
  async toggleSellerMode({ auth, response, session }: HttpContext) {
    const user = auth.user!
    
    user.isSeller = !user.isSeller
    await user.save()

    const status = user.isSeller ? 'Activated (Seller)' : 'Deactivated (Buyer)'
    
    session.flash('success', `Seller Mode ${status}`)
    return response.redirect().back()
  }
}