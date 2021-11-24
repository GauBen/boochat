import type { App } from '../../app'
import type { User, Question, Team, Answer } from '../../types'
import arrayShuffle from 'array-shuffle'
import { GetRequest, PostRequest } from '../../api'
import { ServerEvent } from '../../socket-api'
import { State } from './types'

export default (app: App): void => {
  const { prisma, io, users, teams, config } = app

  let state: State | undefined
  let date = 0
  let question: Question & { answers: Answer[] }
  let answerSet: Set<string>
  let correctAnswers: Set<string>
  let answersReceived: Map<User['id'], Question['body']>
  let bestTeams = new Set<Team['id']>()
  let ratios: Map<Team['id'], number>
  let leaderboard: Map<Team['id'], number>

  // eslint-disable-next-line complexity, sonarjs/cognitive-complexity
  const play = async (_numberOfQuestions: number) => {
    // TODO update loop condition
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const q = await prisma.question.findFirst({
        orderBy: { timesUsed: 'asc' },
        include: { answers: true },
      })
      if (!q) break

      question = q

      await prisma.question.update({
        data: { timesUsed: question.timesUsed + 1 },
        where: { id: question.id },
      })
      let answers = question.answers.map(({ body }) => body)
      if (question.shuffleAnwsers) answers = arrayShuffle(answers)
      answerSet = new Set(answers)

      correctAnswers = new Set(
        question.answers
          .filter(({ correct }) => correct)
          .map(({ body }) => body)
      )

      // Envoyer la question aux gens
      state = State.Question
      date = Date.now()
      answersReceived = new Map()
      io.emit(ServerEvent.QuestionStarts, {
        question: question.body,
        answers,
        category: question.category,
        points: question.points,
      })

      await new Promise((resolve) => {
        setTimeout(resolve, config.get('quizz').question)
      })

      // Sauvegarder les réponses et les stats
      const answerCount = new Map<Team['id'], number>()
      const correctAnswerCount = new Map<Team['id'], number>()

      for (const [id, answer] of answersReceived) {
        const user = users.get(id)
        if (!user) continue
        answerCount.set(user.teamId, (answerCount.get(user.teamId) ?? 0) + 1)
        if (correctAnswers.has(answer)) {
          correctAnswerCount.set(
            user.teamId,
            (correctAnswerCount.get(user.teamId) ?? 0) + 1
          )
        }
      }

      ratios = new Map<Team['id'], number>()
      let bestRatio = 0
      bestTeams = new Set<Team['id']>()

      for (const id of teams.keys()) {
        ratios.set(id, 0)
        const aC = answerCount.get(id) ?? 0
        if (aC === 0) continue
        const ratio = (correctAnswerCount.get(id) ?? 0) / aC
        ratios.set(id, ratio)
        if (ratio === 0) continue
        if (ratio > bestRatio) {
          bestTeams = new Set([id])
          bestRatio = ratio
        } else if (ratio === bestRatio) {
          bestTeams.add(id)
        }
      }

      for (const [id, team] of teams) {
        if (!team.pickable || !answerCount.get(id)) continue
        await prisma.questionStats.create({
          data: {
            answers: answerCount.get(id) ?? 0,
            correctAnswsers: correctAnswerCount.get(id) ?? 0,
            questionId: question.id,
            teamId: id,
            points: bestTeams.has(id) ? question.points : 0,
          },
        })
      }

      // Envoyer la réponse
      io.emit(ServerEvent.QuizzAnswers, {
        correctAnswers: [...correctAnswers],
        bestTeams: [...bestTeams],
        ratios: [...ratios.entries()],
      })

      state = State.Answer
      date = Date.now()
      await new Promise((resolve) => {
        setTimeout(resolve, config.get('quizz').answer)
      })

      const stats = await prisma.questionStats.groupBy({
        by: ['teamId'],
        _sum: {
          points: true,
        },
        where: {
          createdAt: { gte: new Date(Date.now() - 1000 * 60 * 60) },
          team: { pickable: true },
        },
      })
      leaderboard = new Map(
        stats.map(({ teamId, _sum: { points } }) => [teamId, points ?? 0])
      )

      io.emit(ServerEvent.QuizzLeaderboard, [...leaderboard])

      state = State.Leaderboard
      date = Date.now()
      await new Promise((resolve) => {
        setTimeout(resolve, config.get('quizz').leaderboard)
      })
    }
  }

  void play(60)

  app.post(PostRequest.QuizzAnswer, ({ answer }, user) => {
    if (!user) throw new Error('Utilisateur non connecté')
    if (!answerSet.has(answer)) throw new Error("Cette réponse n'existe pas.")
    answersReceived.set(user.id, answer)
  })

  app.get(GetRequest.GameState, () => {
    const elapsed = Date.now() - date
    if (state === undefined) return

    if (state === State.Question) {
      return {
        state: State.Question,
        elapsed,
        data: {
          question: question.body,
          answers: [...answerSet],
          category: question.category,
          points: question.points,
        },
      }
    }

    if (state === State.Answer) {
      return {
        state: State.Answer,
        elapsed,
        data: {
          question: question.body,
          answers: [...answerSet],
          category: question.category,
          points: question.points,
          bestTeams: [...bestTeams],
          correctAnswers: [...correctAnswers],
          ratios: [...ratios],
        },
      }
    }

    if (state === State.Leaderboard) {
      return {
        state: State.Leaderboard,
        elapsed,
        data: [...leaderboard],
      }
    }
  })
}
