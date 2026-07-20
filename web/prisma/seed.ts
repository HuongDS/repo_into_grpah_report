import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const passwordHash = await bcrypt.hash('npng8386', 10)

  const users = [
    { username: 'admin', role: 'ADMIN' },
    { username: 'sanhnp', role: 'ADMIN' },
    { username: 'vync', role: 'ADMIN' },
    { username: 'huongds', role: 'ADMIN' },
    { username: 'baokg', role: 'ADMIN' }
  ]

  console.log('Seeding database...')

  for (const u of users) {
    const existingUser = await prisma.user.findUnique({ where: { username: u.username } })
    if (!existingUser) {
      await prisma.user.create({
        data: {
          username: u.username,
          password: passwordHash,
          role: u.role
        }
      })
      console.log(`Created user: ${u.username}`)
    } else {
      console.log(`User ${u.username} already exists.`)
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
