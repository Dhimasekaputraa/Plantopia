// start/routes.ts

import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'

// --- IMPORTS CONTROLLER ---
const AuthController = () => import('#controllers/auth_controller')
const ProfileController = () => import('#controllers/profile_controller')
const SellerProductController = () => import('#controllers/seller_products_controller')
const PostsController = () => import('#controllers/posts_controller')
const HomeController = () => import('#controllers/home_controller') 
const LikesController = () => import('#controllers/likes_controller')
const CommentsController = () => import('#controllers/comments_controller')
const MarketplaceController = () => import('#controllers/marketplaces_controller') 
const ShoppingCartsController = () => import('#controllers/shopping_carts_controller')
const OrdersController = () => import('#controllers/orders_controller')
const UserReviewsController = () => import('#controllers/user_reviews_controller') 

// --- PUBLIC ROUTES (Landing Page) ---
router.on('/').render('pages/landing_page/lp').as('home')
router.on('/about').render('pages/landing_page/about_us')
router.on('/contact').render('pages/landing_page/contact_us')

// --- GUEST ROUTES (Belum Login) ---
router.group(() => {
  router.get('/register', [AuthController, 'register']).as('auth.register.show')
  router.post('/register', [AuthController, 'handleRegister']).as('auth.register.store')
  
  router.get('/login', [AuthController, 'login']).as('auth.login.show')
  router.post('/login', [AuthController, 'handleLogin']).as('auth.login.store')
}).middleware(middleware.guest())

// --- SOCIAL PUBLIC FEED ---
router.get('/posts', [PostsController, 'index']).as('posts.index')

// --- AUTH ROUTES (Sudah Login) ---
router.group(() => {
  
  // 1. Authentication
  router.post('/logout', [AuthController, 'logout']).as('auth.logout')
  
  // 2. Profile Management
  router.get('/profile', [ProfileController, 'show']).as('profile')
  router.get('profile/u/:id',[ProfileController,'show']).as('profile.other') //baru: liat profile orang
  router.get('/profile/settings', [ProfileController, 'settings']).as('profile.settings')
  router.post('/profile/update', [ProfileController, 'update']).as('profile.update')
  router.post('/profile/password', [ProfileController, 'changePassword']).as('profile.password')
  router.post('/profile/delete', [ProfileController, 'delete']).as('profile.delete')
  router.post('/profile/toggle-seller', [ProfileController, 'toggleSellerMode']).as('profile.toggleSeller')
  
  // Other user Routes
  
  
  // Address Routes
  router.post('/profile/add-address', [ProfileController, 'addAddress']).as('profile.add_address')
  router.post('/profile/delete-address/:id', [ProfileController, 'deleteAddress']).as('profile.delete_address')
  router.post('/profile/set-default-address/:id', [ProfileController, 'setDefaultAddress']).as('profile.set_default_address')

  
  // 3. SELLER ROUTES
  router.get('/marketplace/my-products', [SellerProductController, 'index']).as('seller.products.index')
  router.get('/marketplace/seller/add', [SellerProductController, 'create']).as('seller.products.create')
  router.post('/marketplace/seller/products', [SellerProductController, 'store']).as('seller.products.store')
  router.get('/marketplace/seller/edit/:id', [SellerProductController, 'edit']).as('seller.products.edit')
  router.post('/marketplace/seller/update/:id', [SellerProductController, 'update']).as('seller.products.update')
  router.post('/marketplace/seller/delete/:id', [SellerProductController, 'destroy']).as('seller.products.destroy')

  // 4. MARKETPLACE BUYER ROUTES
  // Home Market (Search & Filter)
  router.get('/marketplace', [MarketplaceController, 'index']).as('marketplace')
  
  // Detail Product (Dynamic ID)
  router.get('/marketplace/product/:id', [MarketplaceController, 'show']).as('marketplace.product.show')

  // Shopping Cart (Database)
  router.get('/cart', [ShoppingCartsController, 'show']).as('cart.show')
  router.post('/cart/add', [ShoppingCartsController, 'add']).as('cart.add')
  router.post('/cart/update/:id', [ShoppingCartsController, 'update']).as('cart.update')
  router.post('/cart/remove/:id', [ShoppingCartsController, 'remove']).as('cart.remove')

  // Checkout & Order
  router.get('/checkout', [OrdersController, 'show']).as('checkout.show')
  router.post('/orders', [OrdersController, 'store']).as('orders.store')

  // Reviews
  router.get('/reviews/write/:productId', [UserReviewsController, 'create']).as('reviews.create')
  router.post('/reviews', [UserReviewsController, 'store']).as('reviews.store')

  // 5. SOCIAL MEDIA (Community)
  router.get('/socmed', [HomeController, 'index']).as('social.home') 
  router.post('/posts', [PostsController, 'store']).as('posts.store')
  router.put('/posts/:id', [PostsController, 'update']).as('posts.update')
  router.delete('/posts/:id', [PostsController, 'destroy']).as('posts.destroy')
  router.post('/posts/:postId/like', [LikesController, 'toggleLike']).as('posts.like')
  router.post('/comments', [CommentsController, 'store']).as('comments.store')

}).middleware(middleware.auth())