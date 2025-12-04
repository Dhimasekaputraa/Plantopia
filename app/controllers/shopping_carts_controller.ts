import type { HttpContext } from '@adonisjs/core/http'
import ShoppingCart from '#models/shopping_cart'
import ShoppingCartItem from '#models/shopping_cart_item'

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

  // Menambahkan Item
  async add({ request, auth, response, session }: HttpContext) {
    const user = auth.user!
    const { productItemId, quantity } = request.only(['productItemId', 'quantity'])

    // Buat/Ambil Keranjang User
    const cart = await ShoppingCart.firstOrCreate(
      { userId: user.id },
      { userId: user.id }
    )

    // Cek item duplikat
    const existingItem = await ShoppingCartItem.query()
      .where('shopping_cart_id', cart.id)
      .where('product_item_id', productItemId)
      .first()

    if (existingItem) {
      existingItem.quantity += parseInt(quantity)
      await existingItem.save()
    } else {
      await ShoppingCartItem.create({
        shoppingCartId: cart.id,
        productItemId: productItemId,
        quantity: parseInt(quantity)
      })
    }

    session.flash('notification', {
      type: 'success',
      message: 'Product added to cart successfully!'
    })

    return response.redirect().back()
  }

  // Update Quantity (VERSI AMAN)
  async update({ request, response, params }: HttpContext) {
    const quantity = parseInt(request.input('quantity'))
    
    // Gunakan find() biasa, bukan findOrFail() agar tidak crash jika ID hilang
    const item = await ShoppingCartItem.find(params.id)

    // Jika item ditemukan, baru kita update
    if (item) {
      if (quantity > 0) {
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
    // Gunakan find() biasa
    const item = await ShoppingCartItem.find(params.id)
    
    // Hanya hapus jika itemnya ada
    if (item) {
      await item.delete()
    }

    // Jika item tidak ketemu (misal karena database di-reset), 
    // kita tetap redirect balik seolah-olah sukses (karena tujuannya memang menghapus).
    return response.redirect().back()
  }
}