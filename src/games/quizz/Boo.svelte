<script lang="ts">
  import { GetRequest } from '$/api'
  import { get } from '$/fetch'
  import type { Socket } from '$/socket-api'
  import { ServerEvent } from '$/socket-api'
  import type { Team } from '$/types'
  import { onMount } from 'svelte'
  import { State } from './types'

  export let teams: Map<Team['id'], Team>
  export let socket: Socket | undefined

  let question = ''
  let category = ''
  let points = 1
  let bestTeams: Set<Team['id']> = new Set()
  let ratios: Map<Team['id'], number> = new Map()
  let leaderboard: Map<Team['id'], number> = new Map()

  $: questionScores = [...ratios]
    .sort(([, x], [, y]) => y - x)
    .map(([id, ratio]) => ({
      team: teams.get(id),
      best: bestTeams.has(id),
      ratio,
    }))
    .filter(
      (
        x
      ): x is {
        team: Team
        best: boolean
        ratio: number
      } => x.team?.pickable ?? false
    )

  $: totalScores = [...leaderboard]
    .sort(([, x], [, y]) => y - x)
    .map(([id, points]) => ({
      team: teams.get(id),
      points,
    }))
    .filter(
      (
        x
      ): x is {
        team: Team
        points: number
      } => x.team?.pickable ?? false
    )

  onMount(async () => {
    const { body } = await get(GetRequest.GameState)
    state = body?.state
    switch (body?.state) {
      case State.Question: {
        question = body.data.question
        category = body.data.category
        points = body.data.points
        break
      }

      case State.Answer: {
        question = body.data.question
        category = body.data.category
        points = body.data.points
        bestTeams = new Set(body.data.bestTeams)
        ratios = new Map(body.data.ratios)
        break
      }

      case State.Leaderboard: {
        leaderboard = new Map(body.data)
        break
      }

      case undefined:
        break

      // No default
    }
  })

  const listen = (socket: Socket | undefined) => {
    if (!socket) return

    socket.on(ServerEvent.QuestionStarts, (data) => {
      state = State.Question
      question = data.question
      category = data.category
      points = data.points
    })
    socket.on(ServerEvent.QuizzAnswers, (data) => {
      state = State.Answer
      bestTeams = new Set(data.bestTeams)
      ratios = new Map(data.ratios)
    })
    socket.on(ServerEvent.QuizzLeaderboard, (data) => {
      state = State.Leaderboard
      leaderboard = new Map(data)
    })
  }

  let state: State | undefined

  $: listen(socket)
</script>

<div class="boo">
  {#if state === State.Question}
    <div class="question">
      <p>{category}, {points} point{points > 1 ? 's' : ''}</p>
      <h1>{question}</h1>
    </div>
  {:else if state === State.Answer}
    <table>
      {#each questionScores as { team, ratio, best }}
        <tr style="--color: {team.color}">
          <td>
            <img
              src="/images/badges/{team.code}.png"
              alt={team.name}
              class="badge"
            />
            <strong>{team.name}</strong>
          </td>
          <td style="text-align:right">{(ratio * 100).toFixed(1)}%</td>
          <td>
            {#if best}
              <strong>+ {points} point{points > 1 ? 's' : ''}</strong>
            {/if}
          </td>
        </tr>
      {/each}
    </table>
  {:else if state === State.Leaderboard}
    {#each totalScores as { team, points }}
      <tr style="--color: {team.color}">
        <td>
          <img
            src="/images/badges/{team.code}.png"
            alt={team.name}
            class="badge"
          />
          <strong>{team.name}</strong>
        </td>
        <td style="text-align:right">{points}</td>
        <td>point{points > 1 ? 's' : ''}</td>
      </tr>
    {/each}
  {/if}
</div>

<style lang="scss">
  .question {
    > h1,
    > p {
      text-align: center;
    }

    h1 {
      font-size: 1.5em;
    }
  }

  td {
    padding: 0.25em;

    strong {
      color: var(--color);
    }
  }

  .badge {
    width: 1.5em;
    height: 1.5em;
    vertical-align: bottom;
    background-color: var(--color);
    border-radius: 0.25rem;
  }

  .boo {
    font-size: 2em;
  }
</style>
