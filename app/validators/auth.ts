import vine from '@vinejs/vine'
export const authenticateValidator = vine.compile(
  vine.object({
    email: vine.string().trim().email().maxLength(255),

    password: vine
      .string()
      .minLength(8)
      .maxLength(32)
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,32}$/),
  })
)
