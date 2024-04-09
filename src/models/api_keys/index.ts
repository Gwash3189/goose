import { ApiKey } from '@prisma/client'
import { Database } from '../../database'

export async function rotate (database: Database, { id }: { id: string }): Promise<ApiKey> {
  await database.apiKey.update({
    where: { id },
    data: {
      expired: true,
      expiresAt: new Date(),
      updatedAt: new Date()
    }
  })

  return await database.apiKey.create({
    data: {
      expiresAt: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      expired: false,
      owner: {
        connect: {
          id
        }
      }
    }
  })
}
