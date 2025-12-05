// start/routes.ts

import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'

const AuthController = () => import('#controllers/auth_controller')
const ProfileController = () => import('#controllers/profile_controller')
const SellerProductController = () => import('#controllers/seller_products_controller')
const PostsController = () => import('#controllers/posts_controller')
const HomeController = () => import('#controllers/home_controller') 
const LikesController = () => import('#controllers/likes_controller') // <-- TAMBAHKAN INI
const CommentsController = () => import('#controllers/comments_controller')

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


// --- SOCIAL MEDIA: PUBLIC POST ROUTES ---
// Siapa pun dapat melihat daftar posts (feed)
router.get('/posts', [PostsController, 'index']).as('posts.index')


// --- AUTH ROUTES (Sudah Login) ---
router.group(() => {
 // 1. Logout
 router.post('/logout', [AuthController, 'logout']).as('auth.logout')
 
 // 2. Profile Management
 router.get('/profile', [ProfileController, 'show']).as('profile')
 router.get('/profile/settings', [ProfileController, 'settings']).as('profile.settings')
 router.post('/profile/update', [ProfileController, 'update']).as('profile.update')
 router.post('/profile/password', [ProfileController, 'changePassword']).as('profile.password')
 router.post('/profile/delete', [ProfileController, 'delete']).as('profile.delete')
 
 // ROUTE BARU: Toggle Seller Mode
 router.post('/profile/toggle-seller', [ProfileController, 'toggleSellerMode']).as('profile.toggleSeller')

 // 3. MARKETPLACE SELLER ROUTES
 router.get('/marketplace/my-products', [SellerProductController, 'index']).as('seller.products.index')
 
 router.get('/marketplace/seller/add', [SellerProductController, 'create']).as('seller.products.create')
 router.post('/marketplace/seller/products', [SellerProductController, 'store']).as('seller.products.store')
 
 router.get('/marketplace/seller/edit/:id', [SellerProductController, 'edit']).as('seller.products.edit')
 router.post('/marketplace/seller/update/:id', [SellerProductController, 'update']).as('seller.products.update')
 
 router.post('/marketplace/seller/delete/:id', [SellerProductController, 'destroy']).as('seller.products.destroy')

 // 4. MARKETPLACE BUYER ROUTES (Static)
 router.on('/marketplace').render('pages/marketplace/home_market').as('marketplace')
 router.on('/checkout').render('pages/marketplace/checkout')
 router.on('/cart').render('pages/marketplace/cart')
 router.on('/product').render('pages/marketplace/product')


 // 5. SOCIAL MEDIA
 // UBAH INI: Menggunakan Controller dan diberi nama 'social.home'
 router.get('/socmed', [HomeController, 'index']).as('social.home') 

 // --- 6. SOCIAL MEDIA POST MANAGEMENT (BUTUH AUTH) ---
 // POST /posts: Membuat post baru
 router.post('/posts', [PostsController, 'store']).as('posts.store')

 // PUT /posts/:id: Mengedit post
 router.put('/posts/:id', [PostsController, 'update']).as('posts.update')

 // DELETE /posts/:id: Menghapus post
 router.delete('/posts/:id', [PostsController, 'destroy']).as('posts.destroy')

 // ROUTE BARU: Like/Unlike Post
 router.post('/posts/:postId/like', [LikesController, 'toggleLike']).as('posts.like') // <-- TAMBAHKAN INI

 // ROUTE BARU: Menambahkan Komentar pada Post
 router.post('/comments', [CommentsController, 'store']).as('comments.store') // <-- TAMBAHKAN INI

 //Address Routes
 router.post('/profile/add-address', [ProfileController, 'addAddress']).as('profile.add_address')
 router.post('/profile/delete-address/:id', [ProfileController, 'deleteAddress']).as('profile.delete_address')
 router.post('/profile/set-default-address/:id', [ProfileController, 'setDefaultAddress']).as('profile.set_default_address')

}).middleware(middleware.auth())