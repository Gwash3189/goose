import { z } from 'zod'

const entityId = z.string().uuid()

export type CreateParams = z.infer<typeof create.params>

export type ListParams = z.infer<typeof list.params>

export type ShowParams = z.infer<typeof show.params>

export type CreateBody = z.infer<typeof create.body>

export type RotateBody = z.infer<typeof rotate.body>

export type VerifyBody = z.infer<typeof rotate.body>

export const list = {
  params: z.object({
    entityId: z.string()
  })
}

export const show = {
  params: z.object({
    apiKeyId: z.string()
  })
}

export const create = {
  params: z.object({
    entityId
  }),
  body: z.object({
    expiresAt: z.string()
      .datetime()
      .optional()
  })
}

export const rotate = {
  body: z.object({
    key: z.string()
  })
}

export const verify = {
  body: z.object({
    key: z.string()
  })
}
