export interface Team {
  id: number
  name: string
  color: string
}

export class TeamEntity {
  id: number
  name: string
  color: string
  constructor({ id, name, color }: Team) {
    this.id = id
    this.name = name
    this.color = color
  }
}

export interface User {
  id: number
  name: string
  team: Team
}

export class UserEntity implements User {
  id: number
  name: string
  team: Team
  constructor({ id, name, team }: User) {
    this.id = id
    this.name = name
    this.team = new TeamEntity(team)
  }
}

export interface Message {
  id: number
  author: User
  body: string
}

export class MessageEntity implements Message {
  id: number
  author: UserEntity
  body: string
  constructor({ id, author: login, body: msg }: Message) {
    this.id = id
    this.author = new UserEntity(login)
    this.body = msg
  }
}
