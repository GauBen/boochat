import type { JTDDataType } from 'ajv/dist/core'
import type { GetRequest, PostRequest, Response, schemas } from './api'
import { api } from './href'

export const get = async <T extends GetRequest>(
  uri: T
): Promise<{ response: globalThis.Response; body: Response[T] }> => {
  const token = localStorage.getItem('token')
  const response = await fetch(api(uri), {
    headers: token
      ? {
          // eslint-disable-next-line @typescript-eslint/naming-convention
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
  const token = localStorage.getItem('token')
  const response = await fetch(api(uri), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token
        ? {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            Authorization: `Token ${token}`,
          }
        : {}),
    },
    body: JSON.stringify(requestBody),
  })
  const responseBody = (await response.json()) as Response[T]
  return { response, body: responseBody }
}
