import type { App } from '../../app'
import type { User, Question, Team } from '../../types'
import arrayShuffle from 'array-shuffle'
import { PostRequest } from '../../api'
import { ServerEvent } from '../../socket-api'
import { State } from './types'

export default (app: App): void => {
  const { prisma, io, users, teams, config } = app

  let state: State | undefined
  let date: number
  let answerSet: Set<string>
  let answersReceived: Map<User['id'], Question['body']>

  // eslint-disable-next-line complexity, sonarjs/cognitive-complexity
  const play = async (numberOfQuestions: number) => {
    const questions = await prisma.question.findMany({
      orderBy: { timesUsed: 'asc' },
      take: numberOfQuestions,
      include: { answers: true },
    })

    while (questions.length > 0) {
      const question = questions.shift()
      if (!question) break
      questions.push(question)
      await prisma.question.update({
        data: { timesUsed: question.timesUsed + 1 },
        where: { id: question.id },
      })
      let answers = question.answers.map(({ body }) => body)
      if (question.shuffleAnwsers) answers = arrayShuffle(answers)
      answerSet = new Set(answers)

      const correctAnswers = new Set(
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

      let bestRatio = 0
      let bestTeams = new Set<Team['id']>()

      for (const id of teams.keys()) {
        const aC = answerCount.get(id) ?? 0
        if (aC === 0) continue
        const ratio = (correctAnswerCount.get(id) ?? 0) / aC
        if (ratio > bestRatio) {
          bestTeams = new Set([id])
          bestRatio = ratio
        } else if (ratio === bestRatio) {
          bestTeams.add(id)
        }
      }

      for (const [id, team] of teams) {
        if (!team.pickable) continue
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
      io.emit(ServerEvent.QuizzAnswers, [...correctAnswers])

      state = State.Answer
      date = Date.now()
      await new Promise((resolve) => {
        setTimeout(resolve, config.get('quizz').answer)
      })

      const rawStats = await prisma.questionStats.groupBy({
        by: ['teamId'],
        _sum: {
          points: true,
        },
        where: {
          createdAt: { gte: new Date(Date.now() - 1000 * 60 * 60) },
        },
      })
      console.log(rawStats)

      // Envoyer le classement
      console.log(date, state)
    }
  }

  void play(60)

  app.post(PostRequest.QuizzAnswer, ({ answer }, user) => {
    if (!user) throw new Error('Utilisateur non connecté')
    if (!answerSet.has(answer)) throw new Error("Cette réponse n'existe pas.")
    answersReceived.set(user.id, answer)
  })
}
