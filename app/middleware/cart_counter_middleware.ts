import type { HttpContext } from '@adonisjs/core/http'
import ShoppingCart from '#models/shopping_cart'

export default class CartCounterMiddleware {
  async handle({ auth, view }: HttpContext, next: () => Promise<void>) {
    let cartCount = 0

    // Jika user sedang login, hitung isi keranjang di DB
    if (auth.user) {
      const cart = await ShoppingCart.query()
        .where('userId', auth.user.id)
        .preload('items')
        .first()

      if (cart && cart.items) {
        // Jumlahkan semua quantity item
        cartCount = cart.items.reduce((sum, item) => sum + item.quantity, 0)
      }
    }

    // Kirim variabel 'cartCount' ke SEMUA file .edge (View)
    view.share({ cartCount })

    await next()
  }
}