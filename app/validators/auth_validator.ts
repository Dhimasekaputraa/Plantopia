import vine from '@vinejs/vine'

/**
 * Validator untuk register user baru
 */
export const registerValidator = vine.compile(
  vine.object({
    firstName: vine.string().trim().minLength(2).maxLength(100),
    lastName: vine.string().trim().minLength(2).maxLength(100),
    email: vine
      .string()
      .email()
      .normalizeEmail()
      .unique(async (db, value) => {
        const user = await db.from('users').where('email', value).first()
        return !user
      }),
    phoneNumbers: vine.string().trim().optional(),
    password: vine.string().minLength(8).maxLength(32),
    passwordConfirmation: vine.string().sameAs('password'),
  })
)

/**
 * Validator untuk login
 */
export const loginValidator = vine.compile(
  vine.object({
    email: vine.string().email().normalizeEmail(),
    password: vine.string(),
  })
)