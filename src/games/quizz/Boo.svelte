<script lang="ts">
  import type { Socket } from 'socket.io-client'
  import type { Team } from 'src/entities'
  import { onMount } from 'svelte'

  export let socket: Socket | undefined = undefined

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

  const listen = (socket: Socket | undefined) => {
    if (!socket) return
    socket.on('game', (evt) => {
      results = new Map(evt)
    })
    socket.on('game-settings', (x) => {
      question = x.value
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
