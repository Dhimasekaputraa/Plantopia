import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Country from '#models/country'

export default class extends BaseSeeder {
  async run() {
    await Country.createMany([
      { id: 1, name: 'Indonesia' },
      { id: 2, name: 'Singapore' },
      { id: 3, name: 'Malaysia' },
      { id: 4, name: 'Thailand' },
      { id: 5, name: 'Philippines' },
    ])
  }
}