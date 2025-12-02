import { BaseSeeder } from '@adonisjs/lucid/seeders'
import ProductCategory from '#models/product_category'

export default class extends BaseSeeder {
  async run() {
    await ProductCategory.updateOrCreateMany('categoryName', [
      { categoryName: 'Indoor' },
      { categoryName: 'Outdoor' },
      { categoryName: 'Succulents' },
      { categoryName: 'Herbs' },
    ])
  }
}