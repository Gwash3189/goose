import express from 'express'
import { db } from './db'
import { identities } from './schema'
import { count, sql } from 'drizzle-orm'

const app = express()
const port = 3000

app.get('/health', async (_request, response) => {
  const canIHitTheDatabase = await db.select({
    count: count(identities.id)
  }).from(identities).get()


  console.log(canIHitTheDatabase)


  response.json({
    healthy: !!canIHitTheDatabase
  })
})


app.listen(port, () => {
  console.log('Server running on ', port)
})
