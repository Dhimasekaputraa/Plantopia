import { test } from '@japa/runner'
import ProductCategory from '#models/product_category'

test.group('Database seeding test', () => {
  test('verify categories are seeded in test database', async ({ assert }) => {
    const categories = await ProductCategory.all()
    assert.isAbove(categories.length, 0)
    
    const categoryNames = categories.map((c) => c.categoryName)
    assert.include(categoryNames, 'Indoor')
    assert.include(categoryNames, 'Outdoor')
    assert.include(categoryNames, 'Succulents')
    assert.include(categoryNames, 'Herbs')
  })
})
