import type { HttpContext } from '@adonisjs/core/http'
import ShopOrder from '#models/shop_order'
import db from '@adonisjs/lucid/services/db'

export default class SellerOrdersController {
  /**
   * Show detailed information about a specific transaction for the seller
   */
  async show({ view, auth, params, response }: HttpContext) {
    const user = auth.user!
    
    // Fetch the order, but only if it contains items belonging to this seller
    // We also only preload the items that belong to this seller
    const order = await ShopOrder.query()
      .where('id', params.id)
      .whereHas('items', (itemQuery) => {
        itemQuery.whereHas('productItem', (productItemQuery) => {
          productItemQuery.whereHas('product', (productQuery) => {
            productQuery.where('userId', user.id)
          })
        })
      })
      .preload('user') // Buyer info
      .preload('items', (itemQuery) => {
        // Only load items belonging to the seller
        itemQuery.whereHas('productItem', (productItemQuery) => {
          productItemQuery.whereHas('product', (productQuery) => {
            productQuery.where('userId', user.id)
          })
        })
        .preload('productItem', (pi) => pi.preload('product'))
      })
      .first()

    if (!order) {
      return response.redirect().toRoute('seller.products.index')
    }

    // Calculate total for THIS seller's products in this order
    const sellerTotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)

    return view.render('pages/marketplace/seller/order_detail', { 
      order, 
      sellerTotal 
    })
  }

  /**
   * Accept an order and mark as shipped. This also decreases stock.
   */
  async accept({ auth, params, response, session }: HttpContext) {
    const user = auth.user!
    const trx = await db.transaction()

    try {
      const order = await ShopOrder.query({ client: trx })
        .where('id', params.id)
        .whereHas('items', (itemQuery) => {
          itemQuery.whereHas('productItem', (productItemQuery) => {
            productItemQuery.whereHas('product', (productQuery) => {
              productQuery.where('userId', user.id)
            })
          })
        })
        .preload('items', (itemQuery) => {
          itemQuery.whereHas('productItem', (productItemQuery) => {
            productItemQuery.whereHas('product', (productQuery) => {
              productQuery.where('userId', user.id)
            })
          })
          .preload('productItem', (pi) => pi.preload('product'))
        })
        .first()

      if (!order) {
        await trx.rollback()
        session.flash('notification', { type: 'error', message: 'Order not found or not yours.' })
        return response.redirect().back()
      }

      // 1. Update Stock and Sold Count for the items BELONGING to this seller
      for (const item of order.items) {
        const productItem = item.productItem
        productItem.useTransaction(trx)
        productItem.qtyInStock -= item.quantity
        
        if (productItem.qtyInStock < 0) {
            throw new Error(`Insufficient stock for ${productItem.product.name}`)
        }
        await productItem.save()

        const product = productItem.product
        product.useTransaction(trx)
        product.soldCount = (product.soldCount || 0) + item.quantity
        await product.save()
      }

      // 2. Update Order Status to 'Shipped' (ID: 3)
      order.useTransaction(trx)
      order.orderStatusId = 3
      await order.save()

      await trx.commit()
      session.flash('notification', { type: 'success', message: 'Order accepted and shipped! Product stock updated.' })
      return response.redirect().back()

    } catch (error) {
      await trx.rollback()
      session.flash('notification', { type: 'error', message: 'Failed to accept order: ' + error.message })
      return response.redirect().back()
    }
  }

  /**
   * Decline an order and mark as cancelled.
   */
  async decline({ auth, params, response, session }: HttpContext) {
    const user = auth.user!
    const order = await ShopOrder.query()
      .where('id', params.id)
      .whereHas('items', (itemQuery) => {
        itemQuery.whereHas('productItem', (productItemQuery) => {
          productItemQuery.whereHas('product', (productQuery) => {
            productQuery.where('userId', user.id)
          })
        })
      })
      .first()

    if (!order) {
      session.flash('notification', { type: 'error', message: 'Order not found or not yours.' })
      return response.redirect().back()
    }

    // Update Order Status to 'Cancelled' (ID: 5)
    order.orderStatusId = 5
    await order.save()

    session.flash('notification', { type: 'success', message: 'Order declined and cancelled.' })
    return response.redirect().back()
  }
}
