import { z } from 'zod'

const nameSchema = z.string().min(1).max(255)
const bodySchema = z.object({
  name: nameSchema
})

const paramsSchema = z.object({
  accountId: z.string().uuid()
})
const deleteSchema = paramsSchema
const showSchema = paramsSchema

export type UpdateParams = z.infer<typeof paramsSchema>
export type DeleteParams = z.infer<typeof paramsSchema>
export type ShowParams = z.infer<typeof showSchema>
export type UpdateBody = z.infer<typeof bodySchema>
export type CreateBody = z.infer<typeof bodySchema>

export const update = {
  name: nameSchema,
  params: paramsSchema,
  body: bodySchema
}

export const create = { ...update }

export const del = { params: deleteSchema }

export const show = { params: showSchema }
