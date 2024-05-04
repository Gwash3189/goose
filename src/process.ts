import { z } from 'zod'
import 'dotenv/config'

const schema = z.object({
  DATABASE_URL: z.string(),
  PORT: z.string(),
  JWT_SECRET: z.string(),
  NODE_ENV: z.literal('development').or(z.literal('production')).or(z.literal('test'))
})

export type Env = z.infer<typeof schema>

export const env = schema.parse(process.env)
