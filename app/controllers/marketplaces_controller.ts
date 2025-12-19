import type { HttpContext } from '@adonisjs/core/http'
import Product from '#models/product'
import ShopOrder from '#models/shop_order'

/**
 * MarketplaceController
 * Mengatur halaman utama belanja (katalog) dan detail produk.
 */
export default class MarketplaceController {
  
  /**
   * Halaman Katalog Produk
   * Menangani pencarian (search) dan filter kategori.
   */
  async index({ view, request }: HttpContext) {
    const searchQuery = request.input('q')
    const categoryFilter = request.input('category')
    
    // Base Query: Ambil produk beserta relasi penting
    const productsQuery = Product.query()
      .preload('user')
      .preload('category')
      .preload('items')
      .preload('reviews')
      .orderBy('createdAt', 'desc')

    // Filter Search (Berdasarkan Nama)
    if (searchQuery) {
      productsQuery.where('name', 'like', `%${searchQuery}%`)
    }

    // Filter Kategori
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

  /**
   * Halaman Detail Produk
   * Menampilkan info produk dan mengecek apakah user berhak memberikan review.
   */
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
        // LOGIKA IZIN REVIEW:
        
        // 1. Cek Riwayat Pembelian: Cari di tabel ShopOrder -> Items
        const hasPurchased = await ShopOrder.query()
            .where('userId', auth.user.id)
            .whereHas('items', (itemsQuery) => {
                itemsQuery.whereHas('productItem', (piQuery) => {
                    piQuery.where('productId', product.id)
                })
            })
            .first()
        
        // 2. Cek Riwayat Review: Apakah user sudah pernah review produk ini?
        const hasReviewed = product.reviews.some(r => r.userId === auth.user!.id)

        // Debugging (bisa dilihat di terminal)
        console.log(`User: ${auth.user.email} | Product: ${product.name}`)
        console.log(`Has Purchased: ${!!hasPurchased} | Has Reviewed: ${hasReviewed}`)

        // 3. Keputusan Akhir: Boleh review jika SUDAH beli dan BELUM review
        canReview = !!hasPurchased && !hasReviewed
        
        // Status untuk debug visual di view (opsional)
        if (!hasPurchased) purchaseStatus = 'Belum Beli'
        if (hasReviewed) purchaseStatus = 'Sudah Review'
        if (canReview) purchaseStatus = 'Boleh Review'
      }

      return view.render('pages/marketplace/product', { 
        product,
        canReview,
        purchaseStatus 
      })

    } catch (error) {
      console.error('Error Marketplace Show:', error)
      return response.redirect('/marketplace')
    }
  }
}