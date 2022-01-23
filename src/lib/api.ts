import type { GetResponse as GetResponseTeams } from '$routes/api/teams.json'

export interface Response {
  '/api/teams.json': GetResponseTeams
}

export const get = async <T extends keyof Response>(uri: T) =>
  fetch(uri).then(async (response) => response.json()) as Promise<Response[T]>
