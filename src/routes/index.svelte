<script lang="ts">
  import type { Socket } from 'socket.io-client'
  import { io } from 'socket.io-client'
  import { onMount } from 'svelte'
  import { writable } from 'svelte/store'
  import Admin from '../components/Admin.svelte'
  import GameController from '../components/GameController.svelte'
  import Messenger from '../messenger/Messenger.svelte'

  let socket: Socket | undefined

  let loggedIn: boolean | undefined

  onMount(async () => {
    const token = sessionStorage.getItem('token')
    if (token === null) {
      loggedIn = false
    } else {
      fetch('//localhost:3001/api/is-logged-in', {
        method: 'POST',
        body: JSON.stringify({ token }),
        headers: { 'Content-Type': 'application/json' },
      })
        .then(async (r) => r.json())
        .then((response) => {
          loggedIn = response
        })
        .catch((error) => {
          console.error(error)
        })
    }

    socket = io(':3001', {
      auth: { token },
    })

    socket.on('logged out', () => {
      loggedIn = false
    })
  })

  const logout = () => {
    sessionStorage.removeItem('token')
    loggedIn = false
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

<main>
  <nav>
    <input type="radio" bind:group={$nav} value="0" id="chat" />
    <label for="chat">Chat</label>
    <input type="radio" bind:group={$nav} value="1" id="game" />
    <label for="game">Jeu</label>
    <input type="radio" bind:group={$nav} value="2" id="admin" />
    <label for="admin">Admin</label>
  </nav>
  <div bind:this={app} class="app">
    <section>
      <Messenger {socket} {loggedIn} on:logout={logout} />
    </section>
    <section>
      <GameController {socket} {loggedIn} />
    </section>
    <section>
      <Admin />
    </section>
  </div>
</main>

<style lang="scss">
  main {
    display: flex;
    flex-direction: column;
    height: 100vh;
  }

  nav {
    padding: 1em;
    text-align: center;

    > label {
      padding: 0.5em 1em;
      border: 1px solid black;
    }

    > input {
      display: none;

      &:checked + label {
        background-color: #ccf;
        outline: 1px solid black;
      }
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
