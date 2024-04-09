import { PrismaClient } from '@prisma/client'

export interface Factory {
  drop: (client: PrismaClient) => Promise<void>
}
