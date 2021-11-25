<script lang="ts">
  import { onMount, tick } from 'svelte'
  import { bounceOut } from 'svelte/easing'
  import { GetRequest } from '../../api'
  import { get } from '../../fetch'
  import { ServerEvent, Socket } from '../../socket-api'
  import type { Team } from '../../types'
  import type { CurrentState } from './types'

  export let teams: Map<Team['id'], Team>
  export let socket: Socket | undefined

  let state: CurrentState
  let blinkingCells = new Set<number>()

  const bounce = (_node: Element, _options: unknown) => ({
    duration: 1000,
    easing: bounceOut,
    css: (_t: number, u: number) => `transform: translateY(-${u * 600}px)`,
  })

  // eslint-disable-next-line complexity
  const findWinner = async () => {
    for (let row = 0; row < state.grid.length; row++) {
      for (let column = 0; column < state.grid[row].length; column++) {
        if (typeof state.grid[row][column] !== 'number') continue

        if (
          row <= state.grid.length - 3 &&
          state.grid[row][column] === state.grid[row + 1][column] &&
          state.grid[row][column] === state.grid[row + 2][column]
        ) {
          blinkingCells.add(column * state.grid.length + row)
          blinkingCells.add(column * state.grid.length + row + 1)
          blinkingCells.add(column * state.grid.length + row + 2)
        }

        if (
          column <= state.grid[0].length - 3 &&
          state.grid[row][column] === state.grid[row][column + 1] &&
          state.grid[row][column] === state.grid[row][column + 2]
        ) {
          blinkingCells.add(column * state.grid.length + row)
          blinkingCells.add((column + 1) * state.grid.length + row)
          blinkingCells.add((column + 2) * state.grid.length + row)
        }

        if (
          row <= state.grid.length - 3 &&
          column <= state.grid[0].length - 3 &&
          state.grid[row][column] === state.grid[row + 1][column + 1] &&
          state.grid[row][column] === state.grid[row + 2][column + 2]
        ) {
          blinkingCells.add(column * state.grid.length + row)
          blinkingCells.add((column + 1) * state.grid.length + row + 1)
          blinkingCells.add((column + 2) * state.grid.length + row + 2)
        }

        if (
          row >= 2 &&
          column <= state.grid[0].length - 3 &&
          state.grid[row][column] === state.grid[row - 1][column + 1] &&
          state.grid[row][column] === state.grid[row - 2][column + 2]
        ) {
          blinkingCells.add(column * state.grid.length + row)
          blinkingCells.add((column + 1) * state.grid.length + row - 1)
          blinkingCells.add((column + 2) * state.grid.length + row - 2)
        }
      }
    }

    await tick()
    blinkingCells = blinkingCells
  }

  const listen = (socket: Socket | undefined) => {
    if (!socket) return

    socket.on(ServerEvent.Connect3NextTurn, (state_) => {
      state = state_
      void findWinner()
    })
  }

  onMount(() => {
    void get(GetRequest.Connect3State).then(({ body }) => {
      state = body
      void findWinner()
    })
  })

  $: listen(socket)

  let playingTeam: Team
  $: if (state !== undefined)
    playingTeam = state.turns[state.turn % state.turns.length]

  $: if (state?.turn === 0) blinkingCells = new Set<number>()
</script>

{#if state !== undefined}
  <div class="game">
    <h1>Puissance 3</h1>
    <table>
      <tbody>
        {#each state.grid as cells, row (row)}
          <tr>
            {#each cells as cell, column (column)}
              <td>
                <span class="mask" />
                {#if cell !== undefined}
                  <!-- TIL key forces reactivity when the expression changes \o/ -->
                  {#key state.grid[row][column]}
                    <span
                      class="disc"
                      class:blink={blinkingCells.has(
                        Number(row) + Number(column) * state.grid.length
                      )}
                      style="--color: {teams.get(cell)?.color}"
                      in:bounce
                    />
                  {/key}
                {/if}
              </td>
            {/each}
          </tr>
        {/each}
      </tbody>
      <tr>
        {#each state.grid[0] as _, column}
          <th>{Number(column) + 1}</th>
        {/each}
      </tr>
    </table>
    {#if playingTeam !== undefined}
      <div class="turn">
        Tour de l'équipe <strong style="color: {playingTeam.color}">
          {playingTeam.name}
        </strong>
      </div>
    {/if}
  </div>
{/if}

<style lang="scss">
  h1 {
    margin: 1rem 0;
    font-size: 4em;
  }

  tbody {
    outline: 0.5em solid #333;
  }

  td {
    position: relative;
    width: 4em;
    height: 4em;
  }

  th {
    padding: 0.5em 0;
    font-size: 2em;
  }

  .turn {
    font-size: 2em;
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
    // animation: 1s bounce 1 cubic-bezier(0.31, 0.02, 0.69, 0.71);
  }

  .blink {
    animation: 1s blink infinite;
  }

  // @keyframes bounce {
  //   0% {
  //     transform: translateY(-100vh);
  //   }
  //   80% {
  //     transform: translateY(0vh);
  //   }
  //   90% {
  //     transform: translateY(-5vh);
  //   }
  // }

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
