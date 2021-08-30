import type { App } from '../../app'
import { GetRequest, PostRequest } from '../../api'
import { ClientEvent, ServerEvent } from '../../socket-api'

export default (app: App): void => {
  const results = new Map<number, number>()
  let gameSettings: { value: string } = { value: 'Ca va ?' }

  app.get(GetRequest.GameSettings, () => gameSettings)
  app.get(GetRequest.GameResults, () => [...results.entries()])

  app.post(PostRequest.SetupGame, (gS) => {
    gameSettings = gS
    app.io.emit(ServerEvent.GameSettings, gS)
  })

  app.io.use((socket, next) => {
    const { user } = socket
    socket.on(ClientEvent.Game, () => {
      if (!user) return
      results.set(user.team.id, (results.get(user.team.id) ?? 0) + 1)
      app.io.emit(ServerEvent.Game, [...results.entries()])
    })

    next()
  })
}
