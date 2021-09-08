import type { App } from '../../app'
import arrayShuffle from 'array-shuffle'
import { ServerEvent } from '../../socket-api'

export default (app: App): void => {
  const { prisma, io } = app

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

      // `` const correctAnswers = new Set(
      //   question.answers
      //     .filter(({ correct }) => correct)
      //     .map(({ body }) => body)
      // )

      // Envoyer la question aux gens
      io.emit(ServerEvent.QuestionStarts, {
        question: question.body,
        answers,
        category: question.category,
        points: question.points,
      })

      await new Promise((resolve) => {
        setTimeout(resolve, 5000)
      })

      // Sauvegarder les réponses et les stats

      // Envoyer la réponse

      // Envoyer le classement
    }
  }

  void play(60)
  // Const results = new Map<number, number>()
  // let gameSettings: { value: string } = { value: 'Ca va ?' }

  // app.get(GetRequest.GameSettings, () => gameSettings)
  // app.get(GetRequest.GameResults, () => [...results.entries()])

  // app.post(PostRequest.SetupGame, (gS) => {
  //   gameSettings = gS
  //   app.io.emit(ServerEvent.GameSettings, gS)
  // })

  // app.io.use((socket, next) => {
  //   const { user } = socket
  //   socket.on(ClientEvent.Game, () => {
  //     if (!user) return
  //     results.set(user.team.id, (results.get(user.team.id) ?? 0) + 1)
  //     app.io.emit(ServerEvent.Game, [...results.entries()])
  //   })

  //   next()
  // })
}
