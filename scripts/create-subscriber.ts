import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import bcrypt from 'bcryptjs'
import 'dotenv/config'

const rawUrl = process.env.DATABASE_URL ?? 'postgresql://localhost:5432/tef_lab_dev'
const connectionString = rawUrl.replace('sslmode=require', 'sslmode=no-verify')
const pool = new Pool({ connectionString })
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const adapter = new PrismaPg(pool as any)
const prisma = new PrismaClient({ adapter })

async function main() {
  const hashed = await bcrypt.hash('kamdem', 12)
  const user = await prisma.user.upsert({
    where: { email: 'kamdemfrancksteve@gmail.com' },
    update: {
      name: 'Franck',
      password: hashed,
      role: 'SUBSCRIBER',
      mustChangePassword: false,
    },
    create: {
      name: 'Franck',
      email: 'kamdemfrancksteve@gmail.com',
      password: hashed,
      role: 'SUBSCRIBER',
      mustChangePassword: false,
    },
  })
  console.log(`✅ Abonné créé : ${user.name} <${user.email}> (rôle: ${user.role})`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
