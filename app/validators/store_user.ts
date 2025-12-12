import vine from '@vinejs/vine'

export const storeUserValidator = vine.compile(
  vine.object({
    email: vine.string().trim().email().maxLength(255).unique({ table: 'users', column: 'email' }),

    password: vine
      .string()
      .minLength(8)
      .maxLength(32)
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,32}$/)
      .confirmed(),

    password_confirmation: vine
      .string()
      .minLength(8)
      .maxLength(32)
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,32}$/),

    full_name: vine
      .string()
      .trim()
      .maxLength(100)
      .regex(/^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/),

    date_of_birth: vine.date().optional(),
  })
)
