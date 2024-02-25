import { db } from '../src/db'
import { identities } from '../src/schema'
import { faker } from '@faker-js/faker'
import bcrypt from 'bcrypt'

const values = Array.from(Array(1000).keys())

console.log('Dropping all identities')

await db.delete(identities);

const inserts = values.map(async (number) => {
  const prom = await db.insert(identities).values({
    email: faker.internet.email(),
    password: await bcrypt.hash('password', 10)
  })

  console.log('Inserting identity: ', number)

  return prom
})

await Promise.allSettled(inserts)
