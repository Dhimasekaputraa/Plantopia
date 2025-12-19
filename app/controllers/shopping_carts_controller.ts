import type { HttpContext } from '@adonisjs/core/http'
import ShoppingCart from '#models/shopping_cart'
import ShoppingCartItem from '#models/shopping_cart_item'
import ProductItem from '#models/product_item'

export default class ShoppingCartsController {
  
  // Menampilkan Halaman Keranjang
  async show({ view, auth }: HttpContext) {
    const user = auth.user!
    
    const cart = await ShoppingCart.query()
      .where('user_id', user.id)
      .preload('items', (itemsQuery) => {
        itemsQuery.preload('productItem', (productItemQuery) => {
          productItemQuery.preload('product')
        })
      })
      .first()

    return view.render('pages/marketplace/cart', { cart })
  }

  // Menambahkan Item (Dengan Validasi Stok)
  async add({ request, auth, response, session }: HttpContext) {
    const user = auth.user!
    const { productItemId, quantity } = request.only(['productItemId', 'quantity'])
    const qtyToAdd = parseInt(quantity)

    // 1. Ambil Data Product Item untuk cek stok fisik
    const productItem = await ProductItem.findOrFail(productItemId)

    // 2. Buat/Ambil Keranjang User
    const cart = await ShoppingCart.firstOrCreate(
      { userId: user.id },
      { userId: user.id }
    )

    // 3. Cek apakah item sudah ada di keranjang?
    const existingItem = await ShoppingCartItem.query()
      .where('shopping_cart_id', cart.id)
      .where('product_item_id', productItemId)
      .first()

    // 4. Hitung Total Quantity yang akan terjadi
    let currentQtyInCart = existingItem ? existingItem.quantity : 0
    let finalQty = currentQtyInCart + qtyToAdd

    // 5. VALIDASI STOK: Jika total melebihi stok yang tersedia
    if (finalQty > productItem.qtyInStock) {
        session.flash('notification', {
            type: 'error',
            message: `Stok tidak cukup! Hanya tersisa ${productItem.qtyInStock} barang.`
        })
        return response.redirect().back()
    }

    // 6. Simpan ke database jika lolos validasi
    if (existingItem) {
      existingItem.quantity += qtyToAdd
      await existingItem.save()
    } else {
      await ShoppingCartItem.create({
        shoppingCartId: cart.id,
        productItemId: productItemId,
        quantity: qtyToAdd
      })
    }

    session.flash('notification', {
      type: 'success',
      message: 'Product added to cart successfully!'
    })

    return response.redirect().back()
  }

  // Update Quantity (Dengan Validasi Stok)
  async update({ request, response, params, session }: HttpContext) {
    const quantity = parseInt(request.input('quantity'))
    
    // Gunakan find() biasa
    const item = await ShoppingCartItem.find(params.id)

    // Jika item ditemukan, baru kita update
    if (item) {
      // Load relasi productItem untuk cek stok
      await item.load('productItem')

      if (quantity > 0) {
        // VALIDASI STOK SAAT UPDATE (+ Tombol Plus)
        if (quantity > item.productItem.qtyInStock) {
            session.flash('notification', {
                type: 'error',
                message: `Maksimal stok tersedia hanya ${item.productItem.qtyInStock}.`
            })
            return response.redirect().back()
        }

        item.quantity = quantity
        await item.save()
      } else {
        // Jika qty 0 atau minus, hapus saja
        await item.delete()
      }
    }

    return response.redirect().back()
  }

  // Hapus Item (VERSI AMAN)
  async remove({ params, response }: HttpContext) {
    const item = await ShoppingCartItem.find(params.id)
    
    if (item) {
      await item.delete()
    }

    return response.redirect().back()
  }
}