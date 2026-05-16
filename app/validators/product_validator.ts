import vine from '@vinejs/vine'

/**
 * Common schema for product fields
 */
const productSchema = {
  name: vine.string().trim().minLength(3).maxLength(100),
  description: vine.string().trim().optional(),
  category_id: vine.number(),
  price: vine.number().min(1), // Minimal price 1 (must be > 0)
  stock: vine.number().min(1)   // Minimal stock 1
}

/**
 * Validator for creating a new product
 */
export const createProductValidator = vine.compile(
  vine.object({
    ...productSchema,
  })
)

/**
 * Validator for updating an existing product
 */
export const updateProductValidator = vine.compile(
  vine.object({
    ...productSchema,
  })
)
