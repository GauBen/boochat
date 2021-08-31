import type { RichMessage } from './api'
import type { User, Team } from '@prisma/client'

export enum ClientEvent {
  Message = 'chat message',
  DeleteMessage = 'delete message',
  Game = 'game',
}

export enum ServerEvent {
  Message = 'chat message',
  DeleteMessage = 'delete message',
  LoggedOut = 'logged out',
  GameSettings = 'game settings',
  Game = 'game',
  Stats = 'stats',
}

export interface ClientToServerEvents {
  [ClientEvent.Message]: (message: string) => void
  [ClientEvent.DeleteMessage]: (id: number) => void
  [ClientEvent.Game]: () => void
}

export interface ServerToClientEvents {
  [ServerEvent.Message]: (message: RichMessage) => void
  [ServerEvent.DeleteMessage]: (id: number) => void
  [ServerEvent.LoggedOut]: () => void
  [ServerEvent.GameSettings]: (settings: { value: string }) => void
  [ServerEvent.Game]: (results: Array<[number, number]>) => void
  [ServerEvent.Stats]: (stats: {
    online: number
    connected: number
    users: Array<{
      user: User & {
        team: Team
      }
      online: number
    }>
  }) => void
}
