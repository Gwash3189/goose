import { z } from 'zod'

const name = z.string().min(1).max(255)
const password = z.string().min(8).max(255)
const email = z.string().email()

export type UpdateParams = z.infer<typeof update.params>
export type UpdateBody = z.infer<typeof update.body>
export type CreateParams = z.infer<typeof create.params>
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
    name: z.string().min(1).max(255),
    email: z.string().email(),
    password: z.string().min(8).max(255)
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
