import { PrismaClient } from '@prisma/client'
import { env } from '../process'
import { getClient } from '../../test/support'

export const database = env.NODE_ENV === 'test' ? getClient() : new PrismaClient()
export type Database = typeof database

export function paginate (page: string, pageSize: string): { take: number, offset: number } {
  const take = parseInt(pageSize, 10)
  const offset = parseInt(page, 10) * take

  return {
    take,
    offset
  }
}
