<script lang="ts">
  import type { Me } from '../api'
  import type { Socket } from '../socket-api'
  import type { Team } from '../types'
  import { io } from 'socket.io-client'
  import { onMount } from 'svelte'
  import { writable } from 'svelte/store'
  import { Level, get, post, GetRequest, PostRequest } from '../api'
  import Admin from '../components/Admin.svelte'
  import GameController from '../components/GameController.svelte'
  import Messenger from '../messenger/Messenger.svelte'
  import { ServerEvent, SOCKET_API } from '../socket-api'

  let socket: Socket | undefined
  let teams: Map<Team['id'], Team> = new Map()
  let me: Me | undefined

  onMount(async () => {
    void get(GetRequest.Teams).then(({ body }) => {
      teams = new Map(body.map((team) => [team.id, team]))
    })

    const token = localStorage.getItem('token')
    if (token !== null) {
      void post(PostRequest.Me, { token }).then(({ body }) => {
        me = body
      })
    }

    socket = io(SOCKET_API, {
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

<main style="--color: {me ? me.team.color : '#fff'}">
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
      <Messenger {teams} {socket} {me} on:logout={logout} />
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
  main {
    display: flex;
    flex-direction: column;
    height: 100vh;
    color: #fff;
    background: #222;
  }

  nav {
    display: flex;
    flex-wrap: nowrap;
    gap: 1em;
    padding: 1em;
    overflow: auto;
    box-shadow: 0 0 0.5em #111;
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
      color: #222;
      font-weight: bold;
      text-align: center;
      background: linear-gradient(110deg, var(--color) 50%, #ccc 50.1%);
      background-position: 100% 100%;
      background-size: 250% 100%;
      border: 0;
      border-radius: 0.25rem;
      transition: background-position 0.5s, box-shadow 0.5s;
    }

    input:checked + label {
      color: #222;
      font-weight: bold;
      background-position: 0% 100%;
      box-shadow: 0 0 0.5rem var(--color);
    }

    input:focus + label {
      box-shadow: 0 0 1rem var(--color);
    }
  }

  .app {
    display: flex;
    flex: 1;
    overflow: hidden;
    scroll-snap-type: y mandatory;

    > section {
      display: flex;
      flex-shrink: 0;
      width: 100vw;
      height: 100%;
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
      flex: 1;
      width: auto;
    }
  }
</style>
