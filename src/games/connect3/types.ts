import type { Team } from '../../types'

export type CurrentState = {
  grid: Array<Array<undefined | Team['id']>>
  turns: Team[]
  turn: number
  over: boolean
}
