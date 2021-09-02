import type { RichMessage } from './api'
import type { User, Team } from '@prisma/client'

export enum ClientEvent {
  Message = 'chat message',
  DeleteMessage = 'delete message',
  Game = 'game',
}

export enum ServerEvent {
  DetailedMessage = 'detailed message',
  Message = 'chat message',
  Notice = 'notice',
  DeleteMessage = 'delete message',
  LoggedOut = 'logged out',
  GameSettings = 'game settings',
  Connected = 'connected',
  Game = 'game',
  Stats = 'stats',
}

export interface ClientToServerEvents {
  [ClientEvent.Message]: (message: string) => void
  [ClientEvent.DeleteMessage]: (id: number) => void
  [ClientEvent.Game]: () => void
}

export interface ServerToClientEvents {
  [ServerEvent.DetailedMessage]: (message: RichMessage) => void
  [ServerEvent.Message]: (message: RichMessage) => void
  [ServerEvent.Notice]: (message: string) => void
  [ServerEvent.DeleteMessage]: (id: number) => void
  [ServerEvent.LoggedOut]: () => void
  [ServerEvent.Connected]: () => void
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

export enum Room {
  Chat = 'chat',
  Moderator = 'moderator',
  Admin = 'admin',
}
