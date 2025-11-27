import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { registerValidator, loginValidator } from '#validators/auth_validator'
import { DateTime } from 'luxon'

export default class AuthController {
  /**
   * Tampilkan halaman Register
   */
  async register({ view }: HttpContext) {
    return view.render('pages/auth/register')
  }

  /**
   * Tampilkan halaman Login
   */
  async login({ view }: HttpContext) {
    return view.render('pages/auth/login')
  }

  /**
   * Proses Register
   */
  async handleRegister({ request, response, auth, session }: HttpContext) {
    try {
      const data = await request.validateUsing(registerValidator)

      const user = await User.create({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phoneNumbers: data.phoneNumbers,
        password: data.password,
        isActive: true,
      })

      // Auto login setelah register
      await auth.use('web').login(user)

      session.flash('success', 'Account created successfully! Welcome to Plantopia!')
      return response.redirect('/marketplace')
    } catch (error) {
      if (error.messages) {
        session.flash('errors', error.messages)
      } else {
        session.flash('error', 'Registration failed. Please try again.')
      }
      
      // Flash old input untuk form
      session.flashAll()
      
      return response.redirect().back()
    }
  }

  /**
   * Proses Login
   */
  async handleLogin({ request, response, auth, session }: HttpContext) {
    try {
      const { email, password } = await request.validateUsing(loginValidator)

      const user = await User.verifyCredentials(email, password)

      // Update last login
      user.lastLoginAt = DateTime.now()
      await user.save()

      await auth.use('web').login(user)

      session.flash('success', `Welcome back, ${user.firstName}!`)
      return response.redirect('/marketplace')
    } catch (error) {
      session.flash('errors.auth', 'Invalid email or password')
      session.flashOnly(['email'])
      return response.redirect().back()
    }
  }

  /**
   * Proses Logout
   */
  async logout({ auth, response, session }: HttpContext) {
    await auth.use('web').logout()
    session.flash('success', 'You have been logged out successfully!')
    return response.redirect('/login')
  }
}