import { z } from 'zod'

const name = z.string().min(1).max(255)
const password = z.string().min(8).max(255)
const email = z.string().email()

export type UpdateParams = z.infer<typeof update.params>
export type UpdateBody = z.infer<typeof update.body>
export type CreateParams = z.infer<typeof create.params>
export type DeleteParams = z.infer<typeof del.params>
export type ListParams = z.infer<typeof list.params>
export type ShowParams = z.infer<typeof show.params>
export type CreateBody = z.infer<typeof create.body>
export type AuthenticateBody = z.infer<typeof authenticate.body>

export const update = {
  name,
  password,
  email,
  params: z.object({
    accountId: z.string().uuid(),
    userId: z.string().uuid()
  }),
  body: z.object({
    name,
    email,
    password
  })
}

export const del = {
  params: z.object({
    accountId: z.string().uuid(),
    userId: z.string().uuid()
  })
}

export const list = {
  params: z.object({
    accountId: z.string().uuid()
  })
}

export const show = {
  params: z.object({
    userId: z.string().uuid(),
    accountId: z.string().uuid()
  })
}

export const create = { ...update }

export const authenticate = {
  password,
  email,
  body: z.object({
    email,
    password
  })
}
