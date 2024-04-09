import { afterAll, beforeAll } from 'vitest'
import { createTestDatabase, getClient, tearDownDatabase } from './support'

beforeAll(async () => {
  await createTestDatabase()
})

afterAll(async () => {
  await tearDownDatabase(getClient())
})
