import Conf from 'conf'
import path from 'path'
import { fileURLToPath } from 'url'

export const config = new Conf<{
  chat: { slowdown: number; moderationDelay: number }
  quizz: { question: number; answer: number; leaderboard: number }
}>({
  cwd: path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    '..',
    '..',
    'storage'
  ),
  configName: 'app-config',
  defaults: {
    chat: {
      moderationDelay: 2000,
      slowdown: 5000,
    },
    quizz: {
      question: 15_000,
      answer: 15_000,
      leaderboard: 15_000,
    },
  },
})
