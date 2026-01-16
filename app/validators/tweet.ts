import vine from '@vinejs/vine'

export const createTweetValidator = vine.compile(
  vine.object({
    userId: vine.number().positive(),
    content: vine.string().trim().maxLength(280).nullable(),
    mediaUrl: vine.string().url().nullable(),
    parentId: vine.number().positive().nullable(),
    retweetId: vine.number().positive().nullable(),
  })
)

export const updateTweetValidator = vine.compile(
  vine.object({
    content: vine.string().trim().maxLength(280).nullable(),
    mediaUrl: vine.string().url().nullable(),
  })
)
