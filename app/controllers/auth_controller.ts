import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import vine from '@vinejs/vine'

export default class AuthController {
  // Tampilkan halaman Register
  async register({ view }: HttpContext) {
    return view.render('pages/auth/register')
  }

  // Tampilkan halaman Login
  async login({ view }: HttpContext) {
    return view.render('pages/auth/login')
  }

  // Proses Register
  async handleRegister({ request, response, auth, session }: HttpContext) {
    // 1. Definisikan Schema
    const schema = vine.object({
      email: vine.string().email().unique(async (db, value) => {
        const user = await db.from('users').where('email', value).first()
        return !user
      }),
      password: vine.string().minLength(8),
      terms: vine.accepted() // Validasi checkbox
    })

    // 2. Compile Schema (INI YANG MEMPERBAIKI ERROR)
    const validator = vine.compile(schema)

    // 3. Jalankan Validasi
    const payload = await request.validateUsing(validator)

    // 4. Buat User Baru
    const user = await User.create({
      email: payload.email,
      password: payload.password,
      fullName: 'New User'
    })

    // 5. Login user secara otomatis
    await auth.use('web').login(user)

    session.flash('success', 'Account created successfully!')
    return response.redirect('/')
  }

  // Proses Login
  async handleLogin({ request, response, auth, session }: HttpContext) {
    // Validasi input login sederhana
    const schema = vine.object({
      email: vine.string().email(),
      password: vine.string()
    })
    
    const validator = vine.compile(schema)
    const { email, password } = await request.validateUsing(validator)

    try {
      const user = await User.verifyCredentials(email, password)
      await auth.use('web').login(user)
      return response.redirect('/')
    } catch (error) {
      session.flash('errors.auth', 'Invalid email or password')
      return response.redirect().back()
    }
  }

  // Proses Logout
  async logout({ auth, response }: HttpContext) {
    await auth.use('web').logout()
    return response.redirect('/login')
  }
}