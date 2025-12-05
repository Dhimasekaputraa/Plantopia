import { BaseSeeder } from '@adonisjs/lucid/seeders'
import OrderStatus from '#models/order_status'
import ShippingMethod from '#models/shipping_method'

export default class extends BaseSeeder {
  async run() {
    // 1. Isi Status Pesanan
    await OrderStatus.updateOrCreateMany('id', [
      { id: 1, name: 'Pending', description: 'Order placed, waiting for payment/process' },
      { id: 2, name: 'Processing', description: 'Seller is packing the items' },
      { id: 3, name: 'Shipped', description: 'Package is on the way' },
      { id: 4, name: 'Delivered', description: 'Package received by customer' },
      { id: 5, name: 'Cancelled', description: 'Order cancelled' },
    ])

    // 2. Isi Metode Pengiriman
    await ShippingMethod.updateOrCreateMany('id', [
      { id: 1, name: 'Standard Shipping', price: 5, estimatedDays: '5-7 days' },
      { id: 2, name: 'Express Shipping', price: 15, estimatedDays: '2-3 days' },
      { id: 3, name: 'Same Day', price: 25, estimatedDays: '1 day' },
    ])
  }
}