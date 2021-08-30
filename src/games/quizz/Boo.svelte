<script lang="ts">
  import type {
    ClientToServerEvents,
    ServerToClientEvents,
  } from '../../socket-api'
  import type { Team } from '@prisma/client'
  import type { Socket } from 'socket.io-client'
  import { onMount } from 'svelte'
  import { get, GetRequest } from '../../api'
  import { ServerEvent } from '../../socket-api'

  export let socket:
    | Socket<ServerToClientEvents, ClientToServerEvents>
    | undefined = undefined

  let question = ''
  let results: Map<Team['id'], number> | undefined
  let teams: Team[] | undefined

  onMount(() => {
    void get(GetRequest.GameSettings).then(({ json }) => {
      question = json.value
    })
    void get(GetRequest.GameResults).then(({ json }) => {
      results = new Map(json)
    })
    void get(GetRequest.Teams).then(({ json }) => {
      teams = json
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
