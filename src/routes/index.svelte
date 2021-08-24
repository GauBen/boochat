<script lang="ts">
  import type { User } from '../user'
  import type { Socket } from 'socket.io-client'
  import { io } from 'socket.io-client'
  import { onMount } from 'svelte'
  import Messages from '../components/Messages.svelte'

  let messages: Array<{ login: User; msg: string; id: string }> = []
  let value = ''
  let mod = false

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

    socket.on('chat message', async (msg) => {
      messages = [...messages.slice(-999), msg]
    })

    socket.on('del message', async (id: string) => {
      messages = messages.filter((msg) => msg.id !== id)
    })
  })

  const send = () => {
    if (!socket) return
    socket.emit('chat message', value)
    value = ''
  }

  const del = ({ detail: id }: { detail: string }) => {
    if (!socket) return
    socket.emit('del message', id)
  }

  const logout = () => {
    sessionStorage.removeItem('token')
    loggedIn = false
  }
</script>

<main>
  {#if loggedIn === true}
    <p class="center">
      <label for="mod">
        <input type="checkbox" id="mod" bind:checked={mod} /> Mod view
      </label>
      <button type="button" on:click={logout}>Se déconnecter</button>
    </p>
  {/if}

  <Messages {messages} on:delete={del} {mod} />

  {#if loggedIn === undefined}
    <p class="center">Chargement...</p>
  {:else if loggedIn === true}
    <form
      on:submit|preventDefault={() => {
        send()
      }}
    >
      <input type="text" bind:value />
      <button>Envoyer</button>
    </form>
  {:else}
    <p class="center"><a href="/login">Se connecter</a></p>
  {/if}
</main>

<style lang="scss">
  main {
    display: flex;
    flex-direction: column;
    height: 100vh;
    color: #fff;
    background-color: rgb(41, 37, 65);
  }

  form {
    display: flex;
    gap: 0.5em;
    padding: 1em;

    input {
      flex: 1;
    }

    input,
    button {
      padding: 0.5em;
      color: #000;
      background: #fff;
      border: 1px solid rgb(24, 24, 27);
      border-radius: 0.5em;

      &:focus {
        outline: 0;
        box-shadow: 0 0 3px #fff;
      }
    }
  }

  a {
    color: inherit;
  }

  .center {
    text-align: center;
  }
</style>
