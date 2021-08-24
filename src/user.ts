import hat from 'hat'

export class User {
  name: string
  color: string
  constructor({ name, color }: { name: string; color?: string }) {
    this.name = name
    this.color = color ?? '#' + hat(24)
  }
}
