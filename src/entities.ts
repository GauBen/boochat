export interface Team {
  id: string
  name: string
  color: string
}

export class TeamEntity {
  id: string
  name: string
  color: string
  constructor({ id, name, color }: Team) {
    this.id = id
    this.name = name
    this.color = color
  }
}

export interface User {
  name: string
  team: Team
}

export class UserEntity implements User {
  name: string
  team: Team
  constructor({ name, team }: User) {
    this.name = name
    this.team = team
  }
}

export interface Message {
  id: string
  login: User
  msg: string
}

export class MessageEntity implements Message {
  id: string
  login: UserEntity
  msg: string
  constructor({ id, login, msg }: Message) {
    this.id = id
    this.login = new UserEntity(login)
    this.msg = msg
  }
}
