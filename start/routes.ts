import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'

const AuthController = () => import('#controllers/auth_controller')
const ProfileController = () => import('#controllers/profile_controller')

// Public Landing Pages
router.on('/').render('pages/landing_page/lp').as('home')
router.on('/about').render('pages/landing_page/about_us')
router.on('/contact').render('pages/landing_page/contact_us')

// Guest Routes (Belum login)
router.group(() => {
  router.get('/register', [AuthController, 'register']).as('auth.register.show')
  router.post('/register', [AuthController, 'handleRegister']).as('auth.register.store')
  
  router.get('/login', [AuthController, 'login']).as('auth.login.show')
  router.post('/login', [AuthController, 'handleLogin']).as('auth.login.store')
}).middleware(middleware.guest())

// Auth Routes (Sudah login)
router.group(() => {
  // Logout
  router.post('/logout', [AuthController, 'logout']).as('auth.logout')
  
  // Profile Routes
  router.get('/profile', [ProfileController, 'show']).as('profile')
  router.get('/profile/settings', [ProfileController, 'settings']).as('profile.settings')
  router.post('/profile/update', [ProfileController, 'update']).as('profile.update')
  router.post('/profile/password', [ProfileController, 'changePassword']).as('profile.password')
  router.post('/profile/delete', [ProfileController, 'delete']).as('profile.delete')
  
  // Protected Pages
  router.on('/marketplace').render('pages/marketplace/home_market').as('marketplace')
  router.on('/checkout').render('pages/marketplace/checkout')
  router.on('/cart').render('pages/marketplace/cart')
  router.on('/product').render('pages/marketplace/product')
  router.on('/socmed').render('pages/social_media/home_socmed')
}).middleware(middleware.auth())