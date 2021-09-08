/* eslint-disable sonarjs/no-duplicate-string */
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
          { body: 'La Jamaïque', correct: true },
          { body: 'La France' },
          { body: 'La Panama' },
          { body: "L'argentine" },
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
          { body: 'AC/DC', correct: true },
          { body: 'Toto' },
          { body: 'Les Beatles' },
          { body: 'Les Rolling Stones' },
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
        create: [{ body: 'Normand', correct: true }, { body: 'Breton' }],
      },
    },
  })
  await prisma.question.create({
    data: {
      body: "Quelle était la couleur de l'AE avant l'HAEwaïenne ?",
      category: 'ENSEEIHT',
      answers: {
        create: [
          { body: 'Violet', correct: true },
          { body: 'Glace' },
          { body: 'Vert' },
          { body: 'Rose' },
        ],
      },
    },
  }) // 5
  await prisma.question.create({
    data: {
      body: 'Quels acteurs font les voix des Ratz ?',
      category: 'Cinéma',
      answers: {
        create: [
          { body: 'Eric et Ramzy', correct: true },
          { body: 'McFly et Carlito' },
          { body: 'Macron et Castex' },
          { body: 'Gad Elmaleh et Kev Adams' },
        ],
      },
    },
  })
  await prisma.question.create({
    data: {
      body: 'Bob est né le 1 avril 2001. Bob est...',
      category: 'Astrologie',
      points: 2,
      answers: {
        create: [
          { body: 'Bélier', correct: true },
          { body: 'Poisson' },
          { body: 'Taureau' },
          { body: 'Capricorne' },
        ],
      },
    },
  })
  await prisma.question.create({
    data: {
      body: "Qui a gagné Koh Lanta l'Île des héros en 2020 ?",
      category: 'Télévision',
      points: 2,
      answers: {
        create: [
          { body: 'Naoil', correct: true },
          { body: 'Claude' },
          { body: 'Inès' },
          { body: 'Ahmad' },
        ],
      },
    },
  })
  await prisma.question.create({
    data: {
      body: "L'appendice au fond de la gorge s'appelle l'esperluette ?",
      category: 'Anatomie',
      shuffleAnwsers: false,
      answers: {
        create: [{ body: 'Vrai' }, { body: 'Faux', correct: true }],
      },
    },
  })
  await prisma.question.create({
    data: {
      body: 'Blanche neige et les septs nains de Disney est sorti en...',
      category: 'Cinéma',
      points: 3,
      shuffleAnwsers: false,
      answers: {
        create: [
          { body: '1937', correct: true },
          { body: '1945' },
          { body: '1959' },
          { body: '1962' },
        ],
      },
    },
  }) // 10
  await prisma.question.create({
    data: {
      body: 'À Toulouse on dit...',
      category: 'Sud-Ouest',
      answers: {
        create: [
          { body: 'Pain au chocolat' },
          { body: 'Chocolatine', correct: true },
        ],
      },
    },
  })
  await prisma.question.create({
    data: {
      body: "Quelle autoroute est appelée l'Occitane ?",
      category: 'Sud-Ouest',
      points: 3,
      shuffleAnwsers: false,
      answers: {
        create: [
          { body: "L'A1" },
          { body: "L'A6" },
          { body: "L'A20", correct: true },
          { body: "L'A44" },
        ],
      },
    },
  })
  await prisma.question.create({
    data: {
      body: "Comment s'appelle la junior entreprise de l'école ?",
      points: 2,
      category: 'ENSEEIHT',
      shuffleAnwsers: false,
      answers: {
        create: [
          { body: 'N7Consulting' },
          { body: 'N7 Consulting', correct: true },
          { body: 'n7consulting' },
          { body: 'Les Raptous' },
        ],
      },
    },
  })
  await prisma.question.create({
    data: {
      body: 'Ce quizz est développé avec amour par...',
      category: 'ENSEEIHT',
      answers: {
        create: [
          { body: 'net7', correct: true },
          { body: 'CAn7' },
          { body: 'TVn7' },
          { body: 'Crypto7' },
        ],
      },
    },
  })
  await prisma.question.create({
    data: {
      body: 'ENSEEIHT ça se prononce ?',
      category: 'ENSEEIHT',
      shuffleAnwsers: false,
      answers: {
        create: [
          { body: 'Enne sept' },
          { body: 'Enne saïte' },
          { body: 'Euh enne esse euh euh hi hache té' },
          { body: 'Té bé esse aller aller' },
        ],
      },
    },
  }) // 15
  await prisma.question.create({
    data: {
      body: "C'est le WEI, c'est pas...",
      category: 'ENSEEIHT',
      answers: {
        create: [
          { body: "L'heure de dormir", correct: true },
          { body: 'La fin du monde' },
          { body: "L'épreuve des poteaux" },
          { body: 'Terrible terrible' },
        ],
      },
    },
  })
  await prisma.question.create({
    data: {
      body: 'Il est où le WEI ?',
      category: 'ENSEEIHT',
      answers: {
        create: [
          { body: 'À Figeac', correct: true },
          { body: 'À Padirac' },
          { body: 'À Cognac' },
          { body: 'À Blagnac' },
        ],
      },
    },
  })
  await prisma.question.create({
    data: {
      body: "Un stomatologue étudie l'estomac ?",
      category: 'Anatomie',
      answers: {
        create: [{ body: 'Vrai' }, { body: 'Faux', correct: true }],
      },
    },
  })
  await prisma.question.create({
    data: {
      body: 'Les Corées du Nord et du Sud sont sur le même fuseau horaire ?',
      category: 'Géographie',
      answers: {
        create: [{ body: 'Vrai', correct: true }, { body: 'False' }],
      },
    },
  })
  await prisma.question.create({
    data: {
      body: 'Laquelle de ces prépas ne se situe pas à Toulouse ?',
      category: 'Toulouse',
      points: 3,
      answers: {
        create: [
          { body: 'Gustave Eiffel', correct: true },
          { body: 'Bellevue' },
          { body: 'Pierre de Fermat' },
          { body: 'Déodat de Séverac' },
        ],
      },
    },
  }) // 20
  await prisma.question.create({
    data: {
      body: "À qui doit-on la célèbre phrase \"J'adore l'eau, dans 20-30 ans il n'y en aura plus\" ?",
      category: 'Citation',
      answers: {
        create: [
          { body: 'Jean-Claude Van Damme', correct: true },
          { body: 'Johnny Haliday' },
          { body: 'Cyril Lignac' },
          { body: 'David Trezeguet' },
        ],
      },
    },
  })
  await prisma.question.create({
    data: {
      body: "Quel volcan n'est pas en France ?",
      category: 'Géographie',
      answers: {
        create: [
          { body: "L'Etna", correct: true },
          { body: 'Le Piton de la Fournaise' },
          { body: 'La Soufrière' },
          { body: 'La Montagne Pelée' },
        ],
      },
    },
  })
  await prisma.question.create({
    data: {
      body: "Quand a été fondée l'ENSEEIHT ?",
      category: 'Histoire',
      points: 3,
      shuffleAnwsers: false,
      answers: {
        create: [
          { body: '1885' },
          { body: '1907', correct: true },
          { body: '1911' },
          { body: '1954' },
        ],
      },
    },
  })
  await prisma.question.create({
    data: {
      body: 'Combien y a-t-il de places de le Boo ?',
      category: 'ENSEEIHT',
      shuffleAnwsers: false,
      answers: {
        create: [
          { body: '244' },
          { body: '320' },
          { body: '389', correct: true },
          { body: '462' },
        ],
      },
    },
  })
  await prisma.question.create({
    data: {
      body: 'Combien y a-t-il de stations de métro à Toulouse ?',
      category: 'Toulouse',
      shuffleAnwsers: false,
      points: 2,
      answers: {
        create: [
          { body: '2' },
          { body: '17' },
          { body: '30' },
          { body: '38', correct: true },
        ],
      },
    },
  }) // 25
  await prisma.question.create({
    data: {
      body: 'Le taux alcoométrique volumique du cidre Henry Weston servi au Danu est...',
      category: 'Gastronomie',
      points: 3,
      shuffleAnwsers: false,
      answers: {
        create: [
          { body: '5°' },
          { body: '8,2°', correct: true },
          { body: '10,2°' },
          { body: '96°' },
        ],
      },
    },
  })
  await prisma.question.create({
    data: {
      body: "Comment s'appelle le club Bretagne de l'école ?",
      points: 2,
      category: 'Gastronomie',
      answers: {
        create: [
          { body: 'B7H', correct: true },
          { body: 'Breton7' },
          { body: 'Galette Sau7' },
          { body: 'Mont Saint-Mich7' },
        ],
      },
    },
  })
  await prisma.question.create({
    data: {
      body: 'Le jeu vidéo le plus vendu de tous les temps est...',
      category: 'Jeux vidéo',
      answers: {
        create: [
          { body: 'Minecraft', correct: true },
          { body: 'Wii Sport' },
          { body: 'Super Mario Bros' },
          { body: 'Tetris' },
        ],
      },
    },
  })
  await prisma.question.create({
    data: {
      body: 'Je suis dans la sauce pour les partiels, je vais sur...',
      category: 'ENSEEIHT',
      points: 3,
      answers: {
        create: [
          { body: 'La Frappe', correct: true },
          { body: 'Loca7' },
          { body: 'PackOffice7' },
          { body: "Le toit de l'école" },
        ],
      },
    },
  })
  await prisma.question.create({
    data: {
      body: "Quel âge a la fanfare de l'école, les Trous Balourds ?",
      category: 'Musique',
      shuffleAnwsers: false,
      answers: {
        create: [
          { body: '9 ans' },
          { body: '17 ans', correct: true },
          { body: '56 ans' },
          { body: '77 ans (avant JC)' },
        ],
      },
    },
  }) // 30
}

seed().finally(async () => prisma.$disconnect())
