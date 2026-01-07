import vine from '@vinejs/vine'

export const storeUserValidator = vine.compile(
  vine.object({
    full_name: vine
      .string()
      .trim()
      .maxLength(100)
      .regex(/^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/),

    email: vine.string().trim().email().maxLength(255).unique({ table: 'users', column: 'email' }),

    date_of_birth: vine.date().optional(),

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
  })
)
