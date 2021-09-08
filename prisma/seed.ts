// eslint-disable-next-line import/default
import Prisma from '@prisma/client'

const prisma = new Prisma.PrismaClient()
const seed = async (): Promise<void> => {
  // Teams
  await prisma.team.create({
    data: {
      code: 'bot',
      name: 'BOT',
      color: '#ccc',
      pickable: false,
    },
  })
  await prisma.team.create({
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

  // Questions
  await prisma.question.create({
    data: {
      body: 'Quel drapeau ne contient ni bleu, ni blanc, ni rouge ?',
      category: 'Géographie',
      points: 2,
      answers: {
        create: [
          {
            body: 'La Jamaïque',
            correct: true,
          },
          {
            body: 'La France',
          },
          {
            body: 'La Panama',
          },
          {
            body: "L'argentine",
          },
        ],
      },
    },
  })
  await prisma.question.create({
    data: {
      body: "Quel groupe a sorti l'album le plus vendu de l'année 1980 ?",
      category: 'Musique',
      points: 3,
      answers: {
        create: [
          {
            body: 'AC/DC',
            correct: true,
          },
          {
            body: 'Toto',
          },
          {
            body: 'Les Beatles',
          },
          {
            body: 'Les Rolling Stones',
          },
        ],
      },
    },
  })
  await prisma.question.create({
    data: {
      body: 'Au monopoly, quelle case est la première du plateau ?',
      category: 'Jeux de société',
      points: 3,
      answers: {
        create: [
          {
            body: 'Boulevard de Belleville',
            correct: true,
          },
          {
            body: 'Rue Vaugirard',
          },
          {
            body: 'Rue de Paradis',
          },
          {
            body: 'Avenue Mozart',
          },
        ],
      },
    },
  })
  await prisma.question.create({
    data: {
      body: 'Le mont Saint-Michel est...',
      category: 'Conflit',
      answers: {
        create: [
          {
            body: 'Normand',
            correct: true,
          },
          {
            body: 'Breton',
          },
        ],
      },
    },
  })
  await prisma.question.create({
    data: {
      body: "Quelle était la couleur de l'AE avant l'HAEwaïenne ?",
      category: 'ENSEEIHT',
      answers: {
        create: [
          {
            body: 'Violet',
            correct: true,
          },
          {
            body: 'Glace',
          },
          {
            body: 'Vert',
          },
          {
            body: 'Rose',
          },
        ],
      },
    },
  })
}

seed().finally(async () => prisma.$disconnect())
