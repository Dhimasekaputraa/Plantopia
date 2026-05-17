import type { HttpContext } from '@adonisjs/core/http'
import ShoppingCart from '#models/shopping_cart'
import ShopOrder from '#models/shop_order'
import OrderedProduct from '#models/ordered_product'
import UserAddress from '#models/user_address'
import Promotion from '#models/promotion'
import UserPromotion from '#models/user_promotion'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'

export default class OrdersController {
  
  // 1. Tampilkan Halaman Checkout (Dengan Pengecekan Alamat)
  async show({ view, auth, response, session }: HttpContext) {
    const user = auth.user!

    // A. CEK APAKAH USER PUNYA ALAMAT?
    const userAddress = await UserAddress.query()
      .where('user_id', user.id)
      .orderBy('is_default', 'desc') // Utamakan alamat default
      .preload('address', (q) => q.preload('country'))
      .first()

    // JIKA BELUM ADA ALAMAT -> TENDANG KE SETTINGS
    if (!userAddress) {
      // Kirim Teks Langsung
session.flash('error', 'Anda harus mengisi alamat pengiriman di Profil sebelum melakukan Checkout!')
      return response.redirect().toRoute('profile.settings')
    }

    // B. Lanjut Ambil Keranjang
    const cart = await ShoppingCart.query()
      .where('user_id', user.id)
      .preload('items', (itemsQuery) => {
        itemsQuery.preload('productItem', (pi) => pi.preload('product'))
      })
      .first()

    if (!cart || cart.items.length === 0) {
      session.flash('notification', {
        type: 'error',
        message: 'Keranjang belanja Anda kosong.'
      })
      return response.redirect('/marketplace')
    }

    // Hitung Subtotal
    let subtotal = 0
    cart.items.forEach(item => {
      subtotal += item.quantity * item.productItem.price
    })

    // Fetch active promotions/vouchers claimed by user
    const now = DateTime.now()
    const claimed = await UserPromotion.query()
      .where('userId', user.id)
      .preload('promotion')

    const vouchers = claimed
      .map(up => up.promotion)
      .filter(p => p && p.startDate.toJSDate() <= now.toJSDate() && p.endDate.toJSDate() >= now.toJSDate())
      .sort((a, b) => b.discount - a.discount)

    return view.render('pages/marketplace/checkout', { 
      cart, 
      subtotal, 
      vouchers,
      address: userAddress.address // Kirim data alamat ke view
    })
  }

  // 2. Proses Checkout (Simpan Order)
  async store({ auth, request, session, response }: HttpContext) {
    const user = auth.user!
    const trx = await db.transaction() 

    try {
      // Cek Alamat lagi (untuk keamanan)
      const userAddress = await UserAddress.query({ client: trx })
        .where('user_id', user.id)
        .orderBy('is_default', 'desc')
        .preload('address')
        .first()

      if (!userAddress) {
        await trx.rollback()
        session.flash('notification', { type: 'error', message: 'Alamat tidak ditemukan.' })
        return response.redirect().toRoute('profile.settings')
      }

      // Ambil Keranjang
      const cart = await ShoppingCart.query({ client: trx })
        .where('user_id', user.id)
        .preload('items', (q) => q.preload('productItem', (pi) => pi.preload('product')))
        .first()

      if (!cart || cart.items.length === 0) {
        await trx.rollback()
        return response.redirect('/marketplace')
      }

      // [BARU] VALIDASI: Seller dilarang beli barang sendiri
      for (const item of cart.items) {
        if (item.productItem.product.userId === user.id) {
          await trx.rollback()
          session.flash('notification', { 
            type: 'error', 
            message: `Checkout gagal! Anda tidak diperbolehkan membeli produk Anda sendiri (${item.productItem.product.name}).` 
          })
          return response.redirect().back()
        }
      }

      let orderTotal = 0
      cart.items.forEach(item => {
        orderTotal += item.quantity * item.productItem.price
      })

      // Handle Voucher / Discount
      const promotionId = request.input('promotionId')
      let discountAmount = 0
      let finalPromotionId: number | null = null

      if (promotionId) {
        // Cek apakah user telah mengklaim voucher ini
        const hasClaimed = await UserPromotion.query({ client: trx })
          .where('userId', user.id)
          .where('promotionId', promotionId)
          .first()

        if (!hasClaimed) {
          await trx.rollback()
          session.flash('notification', { 
            type: 'error', 
            message: 'Anda belum mengklaim voucher ini.' 
          })
          return response.redirect().back()
        }

        const promotion = await Promotion.query({ client: trx }).where('id', promotionId).first()
        const now = DateTime.now()
        if (promotion && promotion.startDate <= now && promotion.endDate >= now) {
          finalPromotionId = promotion.id
          discountAmount = Math.round(orderTotal * promotion.discount)
        } else {
          await trx.rollback()
          session.flash('notification', { 
            type: 'error', 
            message: 'Voucher tidak valid atau sudah kedaluwarsa.' 
          })
          return response.redirect().back()
        }
      }

      const finalTotal = orderTotal - discountAmount

      // Simpan Pesanan
      const order = await ShopOrder.create({
        userId: user.id,
        orderDate: DateTime.now(),
        orderStatusId: 1, // Pending
        shippingMethodId: 1, // Standard
        addressId: userAddress.addressId, // Pakai ID Alamat dari Profil
        userPaymentMethodId: null, // Null karena COD
        deliveryAddress: userAddress.address.fullAddress || userAddress.address.street, // Snapshot Teks
        orderTotal: finalTotal,
        promotionId: finalPromotionId,
        discountAmount: discountAmount
      }, { client: trx })

      // D. Simpan Item Pesanan (Tanpa potong stok dulu, nunggu Seller Accept)
      for (const item of cart.items) {
        await OrderedProduct.create({
          shopOrderId: order.id,
          productItemId: item.productItemId,
          quantity: item.quantity,
          price: item.productItem.price
        }, { client: trx })
      }
    

      // Hapus Keranjang & Commit
      await cart.related('items').query().delete()

      // Hapus voucher dari dompet user (karena sudah digunakan)
      if (promotionId) {
        await UserPromotion.query({ client: trx })
          .where('userId', user.id)
          .where('promotionId', promotionId)
          .delete()
      }

      await trx.commit()

      session.flash('notification', {
        type: 'success',
        message: 'Pesanan berhasil dibuat! Terima kasih telah berbelanja.'
      })

      return response.redirect('/marketplace')

    } catch (error) {
      await trx.rollback()
      console.error(error)
      session.flash('notification', {
        type: 'error',
        message: 'Gagal membuat pesanan: ' + error.message
      })
      return response.redirect().back()
    }
  }
}