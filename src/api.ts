import type { Message, Team, User } from '@prisma/client'
import type { JTDDataType } from 'ajv/dist/core'

const API = `//${globalThis?.location?.hostname ?? 'localhost'}:3001/api`

export enum GetRequest {
  Teams = '/teams',
  Messages = '/messages',
  GameSettings = '/game-settings',
  GameResults = '/game-results',
  UsersOnline = '/users-online',
}

export enum PostRequest {
  Login = '/login',
  Token = '/is-logged-in',
  SetupGame = '/setup-game',
}

export const schemas = {
  [PostRequest.Login]: {
    properties: {
      name: { type: 'string' },
      teamId: { type: 'int32' },
    },
  },
  [PostRequest.Token]: {
    properties: {
      token: { type: 'string' },
    },
  },
  [PostRequest.SetupGame]: {
    properties: {
      value: { type: 'string' },
    },
  },
} as const

export type RichMessage = Message & { author: User & { team: Team } }

export interface Response {
  [GetRequest.Teams]: Team[]
  [GetRequest.Messages]: RichMessage[]
  [GetRequest.GameSettings]: { value: string }
  [GetRequest.GameResults]: Array<[number, number]>
  [GetRequest.UsersOnline]: {
    online: number
    connected: number
    users: Array<{
      user: User & { team: Team }
      online: number
    }>
  }
  [PostRequest.Login]: { token: string } | { error: string }
  [PostRequest.Token]: boolean
  [PostRequest.SetupGame]: void
}

export const get = async <T extends GetRequest>(
  uri: T
): Promise<{ response: globalThis.Response; body: Response[T] }> => {
  const token = sessionStorage.getItem('token')
  const response = await fetch(API + uri, {
    headers: token
      ? {
          Authorization: `Token ${token}`,
        }
      : {},
  })
  const body = (await response.json()) as Response[T]
  return { response, body }
}

export const post = async <T extends PostRequest>(
  uri: T,
  requestBody: JTDDataType<typeof schemas[T]>
): Promise<{ response: globalThis.Response; body: Response[T] }> => {
  const token = sessionStorage.getItem('token')
  const response = await fetch(API + uri, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token
        ? {
            Authorization: `Token ${token}`,
          }
        : {}),
    },
    body: JSON.stringify(requestBody),
  })
  const responseBody = (await response.json()) as Response[T]
  return { response, body: responseBody }
}
