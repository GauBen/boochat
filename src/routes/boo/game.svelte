<script lang="ts" context="module">
  import { get } from '$lib/api'
  import type { GetTeams } from '$routes/api/teams.json'
  import type { Load } from '@sveltejs/kit'
  import { io } from 'socket.io-client'
  import { onMount } from 'svelte'
  import Boo from '../../games/connect3/Boo.svelte'
  import type { Socket } from '../../socket-api'
  import type { Team } from '../../types'

  export const load: Load = async ({ fetch }) => ({
    props: {
      team: await get<GetTeams>('/api/teams.json', { fetch }).then(
        (response) => new Map(response.map((team) => [team.id, team]))
      ),
    },
  })
</script>

<script lang="ts">
  export let teams: Map<Team['id'], Team> = new Map()
  let socket: Socket | undefined

  onMount(async () => {
    socket = io()
  })
</script>

<main>
  <Boo {teams} {socket} />
</main>

<style lang="scss">
  main {
    display: flex;
    overflow: hidden;
    height: 100vh;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-weight: bold;
    text-shadow: 0 0 0.25rem #000;
  }
</style>
