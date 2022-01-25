<script lang="ts">
  import { io } from 'socket.io-client'
  import { onMount } from 'svelte'
  import { get } from '$lib/api'
  import Boo from '../../games/connect3/Boo.svelte'
  import type { Socket } from '../../socket-api'
  import type { Team } from '../../types'

  let socket: Socket | undefined
  let teams: Map<Team['id'], Team> = new Map()

  onMount(async () => {
    void get('/api/teams.json').then((response) => {
      teams = new Map(response.map((team) => [team.id, team]))
    })

    socket = io()
  })
</script>

<main>
  <Boo {teams} {socket} />
</main>

<style lang="scss">
  main {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100vh;
    overflow: hidden;
    color: #fff;
    font-weight: bold;
    text-shadow: 0 0 0.25rem #000;
  }
</style>
