import router from '@adonisjs/core/services/router'
const AuthController = () => import('#controllers/auth_controller')

// Landing Pages
router.on('/').render('pages/landing_page/lp')
router.on('/about').render('pages/landing_page/about_us')
router.on('/contact').render('pages/landing_page/contact_us')

// Authentication Routes
router.group(() => {
  router.get('/register', [AuthController, 'register']).as('auth.register.show')
  router.post('/register', [AuthController, 'handleRegister']).as('auth.register.store')
  
  router.get('/login', [AuthController, 'login']).as('auth.login.show')
  router.post('/login', [AuthController, 'handleLogin']).as('auth.login.store')
  
  router.post('/logout', [AuthController, 'logout']).as('auth.logout')
}).middleware(async (ctx, next) => {
  // Bypass middleware guest untuk logout
  if (ctx.request.url().includes('logout')) {
    return next()
  }
  const guest = await import('#middleware/guest_middleware')
  return new guest.default().handle(ctx, next)
})

// Marketplace
router.on('/marketplace').render('pages/marketplace/home_market')
router.on('/checkout').render('pages/marketplace/checkout')
router.on('/cart').render('pages/marketplace/cart')
router.on('/product').render('pages/marketplace/product')

// Social Media
router.on('/socmed').render('pages/social_media/home_socmed')

// Profile
router.on('/profile').render('pages/profile/profile')