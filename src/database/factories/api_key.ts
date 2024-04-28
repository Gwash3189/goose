import { ApiKey, PrismaClient } from '@prisma/client'
import { hash } from '../../security/hash'
import { randomUUID } from 'crypto'
import { FromNow } from '../../time'

export async function create (database: PrismaClient, props: Partial<ApiKey> & { entity: string }): Promise<ApiKey & { initialKey: string }> {
  const key = props?.key ?? randomUUID()
  const hashedKeyResult = await hash(key)

  if (!hashedKeyResult.success) {
    throw new Error('Failed to generate API key')
  }

  return {
    ...(await database.apiKey.create({
      data: {
        ...props,
        entity: props?.entity,
        expiresAt: props?.expiresAt ?? FromNow.years(1),
        key: hashedKeyResult.data
      }
    })),
    initialKey: key
  }
}

export async function drop (database: PrismaClient): Promise<void> {
  await database.apiKey.deleteMany()
}
