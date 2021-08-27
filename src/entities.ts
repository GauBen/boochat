export interface Team {
  id: number
  name: string
  color: string
}

export interface User {
  id: number
  name: string
  team: Team
}

export interface Message {
  id: number
  author: User
  body: string
}
