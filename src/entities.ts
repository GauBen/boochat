import hat from 'hat'

export interface User {
  name: string
  color: string
}

export class UserEntity implements User {
  name: string
  color: string
  constructor({ name, color }: { name: string; color?: string }) {
    this.name = name
    this.color = color ?? '#' + hat(24)
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
