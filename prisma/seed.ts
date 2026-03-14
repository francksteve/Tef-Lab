import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create 4 TEF Canada modules
  const modules = [
    {
      name: 'Compréhension Écrite',
      code: 'CE',
      description: 'Comprenez des documents écrits variés : articles de presse, documents administratifs, textes lacunaires.',
      duration: 60,
      nbQuestions: 40,
    },
    {
      name: 'Compréhension Orale',
      code: 'CO',
      description: 'Comprenez des documents audio variés : annonces, interviews, chroniques radio.',
      duration: 40,
      nbQuestions: 40,
    },
    {
      name: 'Expression Écrite',
      code: 'EE',
      description: 'Produisez des textes écrits structurés : suite d\'article et lettre au journal.',
      duration: 60,
      nbQuestions: 2,
    },
    {
      name: 'Expression Orale',
      code: 'EO',
      description: 'Exprimez-vous à l\'oral : obtenez des informations et présentez/convainquez.',
      duration: 15,
      nbQuestions: 2,
    },
  ]

  for (const mod of modules) {
    await prisma.module.upsert({
      where: { code: mod.code },
      update: mod,
      create: mod,
    })
  }

  console.log('✅ 4 modules créés')

  // Create admin account
  const hashedPassword = await bcrypt.hash('admin@tef-lab', 12)
  await prisma.user.upsert({
    where: { email: 'tifuzzied@gmail.com' },
    update: {},
    create: {
      name: 'Administrateur',
      email: 'tifuzzied@gmail.com',
      password: hashedPassword,
      role: 'ADMIN',
      mustChangePassword: true,
    },
  })

  console.log('✅ Compte admin créé : tifuzzied@gmail.com / admin@tef-lab')
  console.log('Seed terminé avec succès !')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
