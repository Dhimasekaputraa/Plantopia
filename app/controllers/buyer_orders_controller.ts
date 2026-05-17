import type { HttpContext } from '@adonisjs/core/http'
import ShopOrder from '#models/shop_order'

export default class BuyerOrdersController {
  /**
   * List all orders placed by the current user
   */
  async index({ view, auth }: HttpContext) {
    const user = auth.user!
    
    const orders = await ShopOrder.query()
      .where('userId', user.id)
      .preload('items', (itemQuery) => {
        itemQuery.preload('productItem', (pi) => pi.preload('product'))
      })
      .orderBy('createdAt', 'desc')

    return view.render('pages/marketplace/orders', { orders })
  }

  /**
   * Mark an order as received (Done)
   */
  async receive({ auth, params, response, session }: HttpContext) {
    const user = auth.user!
    
    const order = await ShopOrder.query()
      .where('id', params.id)
      .where('userId', user.id)
      .where('orderStatusId', 3) // Only Shipped orders can be received
      .first()

    if (!order) {
      session.flash('notification', { type: 'error', message: 'Order not found or not in Shipped status.' })
      return response.redirect().back()
    }

    // Update Order Status to 'Delivered' (ID: 4)
    order.orderStatusId = 4
    await order.save()

    session.flash('notification', { type: 'success', message: 'Order marked as received. Thank you!' })
    return response.redirect().back()
  }
}
