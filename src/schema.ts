import { randomUUID } from 'crypto'
import { sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const identities = sqliteTable('identities', {
  id: text('id').primaryKey().$default(() => randomUUID()),
  email: text('email', { length: 256 }).unique(),
  password: text('password')
})
