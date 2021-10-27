<script lang="ts">
  import type { Socket } from '../../socket-api'
  import type { Team } from '../../types'
  import { tick } from 'svelte'
  import { bounceOut } from 'svelte/easing'

  export let teams: Map<Team['id'], Team>
  export let socket: Socket | undefined

  const bounce = (_node: Element, _options: unknown) => ({
    duration: 1000,
    easing: bounceOut,
    css: (_t: number, u: number) => `transform: translateY(-${u * 600}px)`,
  })

  let turn = 2
  const u = undefined
  const grid: Array<Array<undefined | Team['id']>> = [
    [u, u, u, u, u, u, u],
    [u, u, u, u, u, u, u],
    [u, u, u, u, u, u, u],
    [u, u, u, u, u, u, u],
    [u, u, u, u, u, u, u],
    [u, u, u, u, u, u, u],
  ]
  let blinkingCells = new Set<number>()

  const insert = async (column: number) => {
    let found = false
    for (let row = grid.length - 1; row >= 0; row--) {
      if (grid[row][column] === undefined) {
        grid[row][column] = turn
        found = true
        break
      }
    }

    if (found) turn = (turn % 3) + 2

    await findWinner()
  }

  // eslint-disable-next-line complexity, sonarjs/cognitive-complexity
  const findWinner = async () => {
    for (let row = 0; row < grid.length; row++) {
      for (let column = 0; column < grid[row].length; column++) {
        if (grid[row][column] === undefined) continue

        if (
          row <= grid.length - 3 &&
          grid[row][column] === grid[row + 1][column] &&
          grid[row][column] === grid[row + 2][column]
        ) {
          blinkingCells.add(column * grid.length + row)
          blinkingCells.add(column * grid.length + row + 1)
          blinkingCells.add(column * grid.length + row + 2)
        }

        if (
          column <= grid[0].length - 3 &&
          grid[row][column] === grid[row][column + 1] &&
          grid[row][column] === grid[row][column + 2]
        ) {
          blinkingCells.add(column * grid.length + row)
          blinkingCells.add((column + 1) * grid.length + row)
          blinkingCells.add((column + 2) * grid.length + row)
        }

        if (
          row <= grid.length - 3 &&
          column <= grid[0].length - 3 &&
          grid[row][column] === grid[row + 1][column + 1] &&
          grid[row][column] === grid[row + 2][column + 2]
        ) {
          blinkingCells.add(column * grid.length + row)
          blinkingCells.add((column + 1) * grid.length + row + 1)
          blinkingCells.add((column + 2) * grid.length + row + 2)
        }

        if (
          row >= 2 &&
          column <= grid[0].length - 3 &&
          grid[row][column] === grid[row - 1][column + 1] &&
          grid[row][column] === grid[row - 2][column + 2]
        ) {
          blinkingCells.add(column * grid.length + row)
          blinkingCells.add((column + 1) * grid.length + row - 1)
          blinkingCells.add((column + 2) * grid.length + row - 2)
        }
      }
    }

    await tick()
    blinkingCells = blinkingCells
  }
</script>

<div class="game">
  <h1>Puissance 3</h1>
  <table>
    {#each Object.entries(grid) as [row, cells]}
      <tr>
        {#each Object.entries(cells) as [column, cell]}
          <td
            on:click={() => {
              void insert(Number(column))
            }}
          >
            <span class="mask" />
            {#if cell !== undefined}
              <span
                class="disc"
                class:blink={blinkingCells.has(
                  Number(row) + Number(column) * grid.length
                )}
                style="--color: {teams.get(cell)?.color}"
                in:bounce
              />
            {/if}
          </td>
        {/each}
      </tr>
    {/each}
  </table>
</div>

<style lang="scss">
  td {
    position: relative;
    width: 4em;
    height: 4em;
  }

  .mask {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    overflow: hidden;

    &::before {
      position: absolute;
      top: -1em;
      right: -1em;
      bottom: -1em;
      left: -1em;
      z-index: 1;
      border: 1.25em solid #333;
      border-radius: 50%;
      content: '';
    }
  }

  .game {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .disc {
    display: block;
    width: 100%;
    height: 100%;
    background-color: var(--color);
    border-radius: 50%;
  }

  .blink {
    animation: 1s blink infinite;
  }

  @keyframes blink {
    0%,
    50% {
      opacity: 0;
    }
    50.1%,
    100% {
      opacity: 1;
    }
  }
</style>
