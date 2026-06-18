import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Promotion from '#models/promotion'
import { DateTime } from 'luxon'


export default class extends BaseSeeder {
  async run() {
    await Promotion.createMany([
      {
        name: 'FIRSTPLAN10',
        description: 'Enjoy a premium 25% discount on your plant orders. Happy planting!',
        discount:0.25,
        startDate: DateTime.now().minus({ days: 5 }),
        endDate: DateTime.now().plus({ days: 60 })
      },
      { 
        name: 'SUNNYDAY5',
        description: 'Warm weather savings! Grab a 5% discount off your total price.',
        discount:0.05,
        startDate: DateTime.now().minus({ days: 5 }),
        endDate: DateTime.now().plus({ days: 60 })
      },
      { 
        name: 'GOOD13S',
        description: 'Lucky savings! Get 13% off on your botanical order.',
        discount:0.13,
        startDate: DateTime.now().minus({ days: 5 }),
        endDate: DateTime.now().plus({ days: 60 })
      },
      { name: 'SUMMERPLAN',
        description: 'Summer savings',
        discount:0.50,
        startDate: DateTime.now().minus({ days: 5 }),
        endDate: DateTime.now().plus({ days: 60 })
      },
    ])
  }
}