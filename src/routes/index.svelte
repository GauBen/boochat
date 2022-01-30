<script lang="ts" context="module">
  import { get } from '$lib/api'
  import type { getMessages } from '$lib/messenger/messages'
  import type { getTeams } from '$lib/users-and-teams/teams'
  import { Thread, Type } from '$messenger/types'
  import type { Load } from '@sveltejs/kit'
  import { io } from 'socket.io-client'
  import { onMount } from 'svelte'
  import { writable } from 'svelte/store'
  import { Level, Me } from '../api'
  import Admin from '../components/Admin.svelte'
  import GameController from '../components/GameController.svelte'
  import Messenger from '../messenger/Messenger.svelte'
  import type { Socket } from '../socket-api'
  import { ServerEvent } from '../socket-api'
  import type { Team } from '../types'
  import type { GetMe } from './api/me.json'

  export const load: Load = async ({ fetch }) => {
    const [teams, thread] = await Promise.all([
      get<typeof getTeams>('/api/teams.json', { fetch }).then(
        (response) => new Map(response.map((team) => [team.id, team]))
      ),
      get<typeof getMessages>('/api/messages.json', { fetch }).then(
        (response) =>
          response.messages.map((message) => ({
            type: Type.Detailed,
            message,
          }))
      ),
    ])

    return {
      props: {
        teams,
        thread,
      },
    }
  }
</script>

<script lang="ts">
  export let thread: Thread
  export let teams: Map<Team['id'], Team> = new Map()

  let socket: Socket | undefined
  let me: Me | undefined

  onMount(async () => {
    const token = localStorage.getItem('token')
    if (token !== null) {
      void get<GetMe>('/api/me.json', { params: { token } }).then((user) => {
        me = user
      })
    }

    socket = io({
      auth: { token },
    })

    socket.on(ServerEvent.LoggedOut, () => {
      me = false
    })

    socket.on(ServerEvent.UserUpdated, (user) => {
      me = user
    })
  })

  const logout = () => {
    localStorage.removeItem('token')
    me = false
  }

  let app: HTMLElement
  const nav = writable('0')

  nav.subscribe((value) => {
    if (!app) return
    app.scrollTo({
      left: Number(value) * app.clientWidth,
      behavior: 'smooth',
    })
  })
</script>

<svelte:window
  on:resize={() => {
    if (!app) return
    app.scrollTo({ left: Number($nav) * app.clientWidth })
  }}
/>

<svelte:head>
  <title>Boochat</title>
</svelte:head>

<main style:--color={me ? me.team.color : '#fff'}>
  <nav>
    <div class="tab">
      <input type="radio" bind:group={$nav} value="0" id="chat" />
      <label for="chat">Chat</label>
    </div>
    <div class="tab">
      <input type="radio" bind:group={$nav} value="1" id="game" />
      <label for="game">Jeu</label>
    </div>
    {#if me && me.level >= Level.Moderator}
      <div class="tab">
        <input type="radio" bind:group={$nav} value="2" id="admin" />
        <label for="admin">Admin</label>
      </div>
    {/if}
  </nav>
  <div bind:this={app} class="app">
    <section>
      <Messenger {thread} {teams} {socket} {me} on:logout={logout} />
    </section>
    <section>
      <GameController {socket} {me} />
    </section>
    {#if me && me.level >= Level.Moderator}
      <section>
        <Admin {socket} />
      </section>
    {/if}
  </div>
</main>

<style lang="scss">
  :global(html) {
    background: #222;
    color: #fff;
  }

  main {
    display: flex;
    height: 100vh;
    flex-direction: column;
  }

  nav {
    display: flex;
    overflow: auto;
    flex-wrap: nowrap;
    padding: 1em;
    box-shadow: 0 0 0.5em #111;
    gap: 1em;
  }

  .tab {
    position: relative;
    flex: 1;

    input {
      position: absolute;
      opacity: 0;
    }

    label {
      display: block;
      padding: 0.5em;
      border: 0;
      background: linear-gradient(110deg, var(--color) 50%, #ccc 50.1%);
      background-position: 100% 100%;
      background-size: 250% 100%;
      border-radius: 0.25rem;
      color: #222;
      font-weight: bold;
      text-align: center;
      transition: background-position 0.5s, box-shadow 0.5s;
    }

    input:checked + label {
      background-position: 0% 100%;
      box-shadow: 0 0 0.5rem var(--color);
      color: #222;
      font-weight: bold;
    }

    input:focus + label {
      box-shadow: 0 0 1rem var(--color);
    }
  }

  .app {
    display: flex;
    overflow: hidden;
    flex: 1;
    scroll-snap-type: y mandatory;

    > section {
      display: flex;
      width: 100vw;
      height: 100%;
      flex-shrink: 0;
      scroll-snap-align: start;
    }
  }

  @media (min-width: 800px) {
    nav {
      display: none;
    }

    main {
      flex-direction: row;
    }

    .app > section {
      width: auto;
      flex: 1;
    }
  }
</style>
