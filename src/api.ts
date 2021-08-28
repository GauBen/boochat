import type { Message, Team, User } from '@prisma/client'
import type { JTDDataType } from 'ajv/dist/core'

const API = '//localhost:3001/api'

export enum GetRequest {
  Messages = '/messages',
}

export enum PostRequest {
  Login = '/login',
  Token = '/is-logged-in',
}

export const schemas = {
  [PostRequest.Login]: {
    properties: {
      login: { type: 'string' },
      teamId: { type: 'int32' },
    },
  },
  [PostRequest.Token]: {
    properties: {
      token: { type: 'string' },
    },
  },
} as const

export type RichMessage = Message & { author: User & { team: Team } }

export interface Response {
  [GetRequest.Messages]: RichMessage[]
  [PostRequest.Login]: { token: string } | { error: string }
  [PostRequest.Token]: boolean
}

export const get = async <T extends GetRequest>(
  uri: T
): Promise<{ response: globalThis.Response; json: Response[T] }> => {
  const response = await fetch(API + uri)
  const json = (await response.json()) as Response[T]
  return { response, json }
}

export const post = async <T extends PostRequest>(
  uri: T,
  body: JTDDataType<typeof schemas[T]>
): Promise<{ response: globalThis.Response; json: Response[T] }> => {
  const response = await fetch(API + uri, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  const json = (await response.json()) as Response[T]
  return { response, json }
}
