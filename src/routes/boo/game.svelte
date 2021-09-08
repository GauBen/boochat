<script lang="ts">
  import type { Socket } from '../../socket-api'
  import type { Team } from '../../types'
  import { io } from 'socket.io-client'
  import { onMount } from 'svelte'
  import { get, GetRequest } from '../../api'
  import Boo from '../../games/quizz/Boo.svelte'

  let socket: Socket | undefined
  let teams: Map<Team['id'], Team> = new Map()

  onMount(async () => {
    void get(GetRequest.Teams).then(({ body }) => {
      teams = new Map(body.map((team) => [team.id, team]))
    })

    socket = io(':3001')
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
