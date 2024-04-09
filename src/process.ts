import { z } from 'zod'
import 'dotenv/config'

const schema = z.object({
  DATABASE_URL: z.string(),
  PORT: z.string()
})

export type Env = z.infer<typeof schema>

export const env = schema.parse(process.env)
