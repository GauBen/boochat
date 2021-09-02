// eslint-disable-next-line import/default
import Prisma from '@prisma/client'
import { Level } from '../src/api'

const prisma = new Prisma.PrismaClient()
const seed = async (): Promise<void> => {
  // Teams
  const sn = await prisma.team.create({
    data: {
      code: 'sn',
      name: 'SN',
      color: '#ff5e5e',
    },
  })
  await prisma.team.create({
    data: {
      code: 'eeea',
      name: 'EEEA',
      color: '#ffff00',
    },
  })
  await prisma.team.create({
    data: {
      code: 'mfee',
      name: 'MFEE',
      color: '#0099ff',
    },
  })

  // Users
  await prisma.user.create({
    data: {
      name: 'gautier',
      inpId: 'benaimg',
      level: Level.Admin,
      teamId: sn.id,
    },
  })
}

seed().finally(async () => prisma.$disconnect())
