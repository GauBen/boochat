<script lang="ts">
  import type {
    ClientToServerEvents,
    ServerToClientEvents,
  } from '../../socket-api'
  import type { Team } from '@prisma/client'
  import type { Socket } from 'socket.io-client'
  import { onMount } from 'svelte'
  import { ServerEvent } from '../../socket-api'

  export let socket:
    | Socket<ServerToClientEvents, ClientToServerEvents>
    | undefined = undefined

  let question = ''
  let results: Map<Team['id'], number> | undefined
  let teams: Team[] | undefined

  onMount(() => {
    fetch('//localhost:3001/api/game-settings')
      .then(async (r) => r.json())
      .then((x) => {
        question = x.value
      })
      .catch((error) => {
        console.error(error)
      })
    fetch('//localhost:3001/api/game-results')
      .then(async (r) => r.json())
      .then((x) => {
        results = new Map(x)
      })
      .catch((error) => {
        console.error(error)
      })
    fetch('//localhost:3001/api/teams')
      .then(async (r) => r.json())
      .then((x) => {
        teams = x
      })
      .catch((error) => {
        console.error(error)
      })
  })

  const listen = (
    socket: Socket<ServerToClientEvents, ClientToServerEvents> | undefined
  ) => {
    if (!socket) return
    socket.on(ServerEvent.Game, (evt) => {
      results = new Map(evt)
    })
    socket.on(ServerEvent.GameSettings, ({ value }) => {
      question = value
    })
  }

  $: listen(socket)
</script>

<h1>{question}</h1>

{#if results && teams}
  {#each teams as { id, name, color } (id)}
    <p>
      <strong style="color: {color}">{name}:</strong>
      {results.get(id) ?? 0}
    </p>
  {/each}
{/if}
