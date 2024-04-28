import { ApiKey, PrismaClient, User } from '@prisma/client'
import { faker } from '@faker-js/faker'
import * as JWT from '../../src/security/jwt'
import { env } from '../../src/process'
import { hash } from '../../src/security/hash'
import { FromNow } from '../../src/time'

const prisma = new PrismaClient()

async function main (): Promise<[ApiKey, User]> {
  // Delete all existing records
  await prisma.user.deleteMany()
  await prisma.apiKey.deleteMany()
  await prisma.account.deleteMany()
  await prisma.owner.deleteMany()

  // Hash the password
  const hashedPassword = await hash('password')

  if (!hashedPassword.success) {
    throw new Error('Failed to hash password')
  }

  // Create new records
  const owner = await prisma.owner.create({
    data: {
      name: 'owner',
      email: 'owner@goose.com'
    }
  })

  const hashedKey = await hash('a9ea20d7-61ed-44b9-adf8-1fe8a3d19907')
  if (!hashedKey.success) {
    throw new Error('Failed to hash key')
  }

  const apiKey = await prisma.apiKey.create({
    data: {
      key: hashedKey.data,
      expiresAt: FromNow.years(1),
      entity: owner.id
    }
  })

  const account = await prisma.account.create({
    data: {
      id: 'f302de08-5cb7-45d5-9364-ebd22a58e127',
      name: 'Goose Account',
      owner: {
        connect: {
          id: owner.id
        }
      }
    }
  })

  const user = await prisma.user.create({
    data: {
      id: '52d34d41-934b-45f8-b2fe-ebfde6acaf1e',
      name: faker.person.firstName(),
      email: 'user@goose.com',
      password: hashedPassword.data,
      account: {
        connect: {
          id: account.id
        }
      }
    }
  })

  for (let i = 0; i < 99; i++) {
    await prisma.user.create({
      data: {
        name: faker.person.firstName(),
        email: faker.internet.email(),
        password: hashedPassword.data,
        account: {
          connect: {
            id: account.id
          }
        }
      }
    })
  }

  return [apiKey, user]
}

main()
  .then(([apiKey, user]) => {
    console.log('Seed completed')
    console.log('API Key:', apiKey.key)
    console.log('User ID:', user.id)
    console.log('Account ID:', user.accountId)
    console.log('JWT Token:', JWT.sign(
      { id: user.id, accountId: user.accountId },
      env.JWT_SECRET,
      { expiresIn: '8h' }
    ))
  })
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => {
    prisma.$disconnect()
      .catch(() => console.log('Somethings gone really wrong'))
  })
