import type { App } from '../../app'
// Import type { User, Team, Answer } from '../../types'
import type { CurrentState } from './types'
import arrayShuffle from 'array-shuffle'
import { GetRequest, PostRequest } from '../../api'
import { ServerEvent } from '../../socket-api'

const rows = 6
const columns = 7

export default async (app: App): Promise<void> => {
  const { io, teams, loaded } = app

  const initState = (): CurrentState => ({
    grid: Array.from({ length: rows }).map(() =>
      Array.from({ length: columns })
    ),
    turns: arrayShuffle([...teams.values()].filter((team) => team.pickable)),
    turn: 0,
  })

  await loaded

  let state: CurrentState
  let movesReceived: Map<number, number>

  app.get(GetRequest.Connect3State, () => state)

  app.post(PostRequest.Connect3Play, ({ move }, user) => {
    if (
      !user ||
      user.teamId !== state.turns[state.turn % state.turns.length].id
    )
      return

    if (move < 0 || move >= columns) return

    movesReceived.set(move, (movesReceived.get(move) ?? 0) + 1)
  })

  const play = async () => {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      state = initState()
      await startGame()
      await new Promise((resolve) => {
        setTimeout(resolve, 20_000)
      })
    }
  }

  const insert = (column: number) => {
    for (let row = state.grid.length - 1; row >= 0; row--) {
      if (state.grid[row][column] === undefined) {
        state.grid[row][column] =
          state.turns[state.turn % state.turns.length].id
        return true
      }
    }

    return false
  }

  // eslint-disable-next-line complexity, sonarjs/cognitive-complexity
  const gameOver = (): boolean => {
    const { grid } = state
    for (let row = 0; row < grid.length; row++) {
      for (let column = 0; column < grid[row].length; column++) {
        if (grid[row][column] === undefined) continue

        if (
          row <= grid.length - 3 &&
          grid[row][column] === grid[row + 1][column] &&
          grid[row][column] === grid[row + 2][column]
        )
          return true

        if (
          column <= grid[0].length - 3 &&
          grid[row][column] === grid[row][column + 1] &&
          grid[row][column] === grid[row][column + 2]
        )
          return true

        if (
          row <= grid.length - 3 &&
          column <= grid[0].length - 3 &&
          grid[row][column] === grid[row + 1][column + 1] &&
          grid[row][column] === grid[row + 2][column + 2]
        )
          return true

        if (
          row >= 2 &&
          column <= grid[0].length - 3 &&
          grid[row][column] === grid[row - 1][column + 1] &&
          grid[row][column] === grid[row - 2][column + 2]
        )
          return true
      }
    }

    return false
  }

  // eslint-disable-next-line sonarjs/cognitive-complexity, complexity
  const startGame = async () => {
    while (state.turn < rows * columns) {
      movesReceived = new Map<number, number>()
      io.emit(ServerEvent.Connect3NextTurn, state)
      await new Promise((resolve) => {
        setTimeout(resolve, 10_000)
      })
      let moves: number[] = []
      let amount = 0
      for (const [column, value] of movesReceived.entries()) {
        if (value < amount) {
          continue
        } else if (value === amount) {
          moves.push(column)
        } else {
          moves = [column]
          amount = value
        }
      }

      // Try all moves to find a legal one, but prefer most voted ones
      const movesToDo = [
        ...arrayShuffle(moves),
        ...arrayShuffle(Array.from({ length: columns }).map((_, i) => i)),
      ]
      while (!insert(movesToDo[0])) movesToDo.shift()

      if (gameOver()) return

      state.turn++
    }
  }

  void play()
}
