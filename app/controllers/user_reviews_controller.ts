import type { HttpContext } from '@adonisjs/core/http'
import UserReview from '#models/user_review'
import Product from '#models/product'
import ShopOrder from '#models/shop_order'

export default class UserReviewsController {
  
  // [BARU] Tampilkan Halaman Form Review
  async create({ params, view, auth, response, session }: HttpContext) {
    const user = auth.user!
    const productId = params.productId

    // 1. Cek Produk
    const product = await Product.find(productId)
    if (!product) return response.redirect('/marketplace')

    // 2. Cek Apakah Sudah Beli?
    const hasPurchased = await ShopOrder.query()
      .where('userId', user.id)
      .whereHas('items', (itemsQuery) => {
        itemsQuery.whereHas('productItem', (piQuery) => {
            piQuery.where('productId', productId)
        })
      })
      .first()

    if (!hasPurchased) {
        session.flash('notification', { type: 'error', message: 'Anda harus membeli produk ini sebelum menulis ulasan.' })
        return response.redirect().back()
    }

    // 3. Cek Apakah Sudah Review?
    const existingReview = await UserReview.query()
        .where('userId', user.id)
        .where('productId', productId)
        .first()

    if (existingReview) {
        session.flash('notification', { type: 'error', message: 'Anda sudah mengulas produk ini sebelumnya.' })
        return response.redirect(`/marketplace/product/${productId}`)
    }

    return view.render('pages/marketplace/reviews/create_review', { product })
  }

  // Simpan Review
  async store({ request, auth, response, session }: HttpContext) {
    const user = auth.user!
    const { productId, rating, comment } = request.only(['productId', 'rating', 'comment'])

    // (Validasi pembelian bisa ditaruh disini lagi untuk keamanan ganda)

    await UserReview.create({
        userId: user.id,
        productId: productId,
        rating: parseInt(rating),
        comment: comment
    })

    session.flash('notification', { type: 'success', message: 'Ulasan berhasil diterbitkan!' })
    // Redirect balik ke halaman detail produk
    return response.redirect(`/marketplace/product/${productId}`)
  }
}