import type { HttpContext } from '@adonisjs/core/http'
import ShoppingCart from '#models/shopping_cart'
import ShopOrder from '#models/shop_order'
import OrderedProduct from '#models/ordered_product'
import ProductItem from '#models/product_item'
import UserAddress from '#models/user_address'
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

    return view.render('pages/marketplace/checkout', { 
      cart, 
      subtotal, 
      address: userAddress.address // Kirim data alamat ke view
    })
  }

  // 2. Proses Checkout (Simpan Order)
  async store({ auth, session, response }: HttpContext) {
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
        .preload('items', (q) => q.preload('productItem'))
        .first()

      if (!cart || cart.items.length === 0) {
        await trx.rollback()
        return response.redirect('/marketplace')
      }

      let orderTotal = 0
      cart.items.forEach(item => {
        orderTotal += item.quantity * item.productItem.price
      })

      // Simpan Pesanan
      const order = await ShopOrder.create({
        userId: user.id,
        orderDate: DateTime.now(),
        orderStatusId: 1, // Pending
        shippingMethodId: 1, // Standard
        addressId: userAddress.addressId, // Pakai ID Alamat dari Profil
        userPaymentMethodId: null, // Null karena COD
        deliveryAddress: userAddress.address.fullAddress || userAddress.address.street, // Snapshot Teks
        orderTotal: orderTotal
      }, { client: trx })

      // D. Pindahkan Item & Update Data Produk
      for (const item of cart.items) {
        // 1. Simpan ke OrderedProduct
        await OrderedProduct.create({
          shopOrderId: order.id,
          productItemId: item.productItemId,
          quantity: item.quantity,
          price: item.productItem.price
        }, { client: trx })

        // 2. AMBIL VARIANT PRODUCT ITEM & KURANGI STOK
        const productItem = await ProductItem.findOrFail(item.productItemId, { client: trx })
        productItem.qtyInStock = productItem.qtyInStock - item.quantity
        
        // Cek stok minus
        if (productItem.qtyInStock < 0) {
            throw new Error(`Stok habis untuk produk ID: ${item.productItemId}`)
        }
        await productItem.save()

        // 3. [BARU] AMBIL PRODUK INDUK & TAMBAH SOLD COUNT
        // Kita perlu load produk induknya dulu dari item
        await productItem.load('product') 
        const product = productItem.product
        
        // Update Sold Count
        product.soldCount = (product.soldCount || 0) + item.quantity
        
        // Simpan perubahan produk menggunakan transaksi yang sama
        product.useTransaction(trx)
        await product.save()
      }
    

      // Hapus Keranjang & Commit
      await cart.related('items').query().delete()
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