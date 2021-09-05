import type { RichMessage, User, Team, DetailedMessage } from './types'
import type { Socket as ClientSocket } from 'socket.io-client'

export type Socket = ClientSocket<ServerToClientEvents, ClientToServerEvents>

export enum ClientEvent {
  Message = 'chat message',
  DeleteMessage = 'delete message',
  RestoreMessage = 'restore message',
  Game = 'game',
}

export enum ServerEvent {
  DetailedMessage = 'detailed message',
  Message = 'chat message',
  Notice = 'notice',
  DeleteMessage = 'delete message',
  RestoreMessage = 'restore message',
  LoggedOut = 'logged out',
  GameSettings = 'game settings',
  Connected = 'connected',
  Game = 'game',
  Stats = 'stats',
  UserUpdated = 'user updated',
}

export interface ClientToServerEvents {
  [ClientEvent.Message]: (message: string) => void
  [ClientEvent.DeleteMessage]: (id: number) => void
  [ClientEvent.RestoreMessage]: (id: number) => void
  [ClientEvent.Game]: () => void
}

export interface ServerToClientEvents {
  [ServerEvent.DetailedMessage]: (message: DetailedMessage) => void
  [ServerEvent.Message]: (message: RichMessage) => void
  [ServerEvent.Notice]: (message: string) => void
  [ServerEvent.DeleteMessage]: (id: number) => void
  [ServerEvent.RestoreMessage]: (id: number) => void
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
  [ServerEvent.UserUpdated]: (user: User & { team: Team }) => void
}

export enum Room {
  Chat = 'chat',
  Moderator = 'moderator',
  Admin = 'admin',
}
