import type { HttpContext } from '@adonisjs/core/http'
import Product from '#models/product'
import ShopOrder from '#models/shop_order' // Pastikan import ini ada

export default class MarketplaceController {
  
  // Method Index (Home)
  async index({ view, request }: HttpContext) {
    const searchQuery = request.input('q')
    const categoryFilter = request.input('category')
    
    const productsQuery = Product.query()
      .preload('user')
      .preload('category')
      .preload('items')
      .preload('reviews')
      .orderBy('createdAt', 'desc')

    if (searchQuery) {
      productsQuery.where('name', 'like', `%${searchQuery}%`)
    }

    if (categoryFilter && categoryFilter !== 'All Plants') {
      productsQuery.whereHas('category', (catQuery) => {
        catQuery.where('categoryName', categoryFilter)
      })
    }

    const products = await productsQuery

    return view.render('pages/marketplace/home_market', { 
      products, 
      searchQuery,
      categoryFilter 
    })
  }

  // Method Show (Detail Produk)
  async show({ params, view, auth, response }: HttpContext) {
    try {
      const product = await Product.query()
        .where('id', params.id)
        .preload('user')
        .preload('category')
        .preload('items')
        .preload('reviews', (reviewsQuery) => {
            reviewsQuery.preload('user').orderBy('createdAt', 'desc')
        })
        .firstOrFail()

      let canReview = false
      let purchaseStatus = 'Belum Login'

      if (auth.user) {
        // 1. Cek Apakah User Pernah Beli Produk Ini?
        // Kita cari di tabel Order -> Item -> ProductItem -> ProductId yang sama
        const hasPurchased = await ShopOrder.query()
            .where('userId', auth.user.id)
            .whereHas('items', (itemsQuery) => {
                itemsQuery.whereHas('productItem', (piQuery) => {
                    piQuery.where('productId', product.id)
                })
            })
            .first()
        
        // 2. Cek Apakah User Sudah Pernah Review?
        const hasReviewed = product.reviews.some(r => r.userId === auth.user!.id)

        // Debugging di Terminal (Cek ini di VSCode Terminal saat refresh halaman)
        console.log(`User: ${auth.user.email} | Product: ${product.name}`)
        console.log(`Has Purchased: ${!!hasPurchased} | Has Reviewed: ${hasReviewed}`)

        // 3. Syarat: Sudah Beli DAN Belum Review
        canReview = !!hasPurchased && !hasReviewed
        
        if (!hasPurchased) purchaseStatus = 'Belum Beli'
        if (hasReviewed) purchaseStatus = 'Sudah Review'
        if (canReview) purchaseStatus = 'Boleh Review'
      }

      return view.render('pages/marketplace/product', { 
        product,
        canReview,
        purchaseStatus // Dikirim untuk debug visual (opsional)
      })

    } catch (error) {
      console.error('Error Marketplace Show:', error)
      return response.redirect('/marketplace')
    }
  }
}