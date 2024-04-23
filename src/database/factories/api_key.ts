import { ApiKey, PrismaClient } from '@prisma/client'

export async function create (database: PrismaClient, props: Partial<ApiKey> & { entity: string }): Promise<ApiKey> {
  return await database.apiKey.create({
    data: {
      ...props,
      entity: props?.entity,
      expiresAt: props?.expiresAt ?? new Date(new Date().setFullYear(new Date().getFullYear() + 1))
    }
  })
}

export async function drop (database: PrismaClient): Promise<void> {
  await database.apiKey.deleteMany()
}
