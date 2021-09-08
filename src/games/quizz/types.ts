import type { Team } from '../../types'

export enum State {
  Question,
  Answer,
  Leaderboard,
}

export type CurrentState =
  | {
      state: State.Question
      elapsed: number
      data: {
        question: string
        category: string
        points: number
        answers: string[]
      }
    }
  | {
      state: State.Answer
      elapsed: number
      data: {
        question: string
        category: string
        points: number
        answers: string[]
        correctAnswers: string[]
        bestTeams: Array<Team['id']>
        ratios: Array<[Team['id'], number]>
      }
    }
  | {
      state: State.Leaderboard
      elapsed: number
      data: Array<[Team['id'], number]>
    }
  | undefined
