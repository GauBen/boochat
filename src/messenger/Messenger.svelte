<script lang="ts">
  import type { Socket } from 'socket.io-client'
  import type { User } from 'src/user'
  import { createEventDispatcher, onMount } from 'svelte'
  import Messages from './Messages.svelte'

  export let loggedIn: boolean | undefined = undefined
  export let mod = false
  export let socket: Socket | undefined = undefined

  let messages: Array<{ id: string; login: User; msg: string }> = []
  let value = ''

  const dispatch = createEventDispatcher<{ logout: void; send: string }>()

  onMount(() => {
    fetch('//localhost:3001/api/messages')
      .then(async (r) => r.json())
      .then((m) => {
        messages = m
      })
      .catch((error) => {
        console.error(error)
      })
  })

  const listen = (socket: Socket | undefined) => {
    if (!socket) return
    socket.on(
      'chat message',
      async (msg: { id: string; login: User; msg: string }) => {
        messages = [...messages.slice(-999), msg]
      }
    )

    socket.on('del message', async (id: string) => {
      messages = messages.filter((msg) => msg.id !== id)
    })
  }

  $: listen(socket)

  const send = () => {
    if (!socket) return
    socket.emit('chat message', value)
    value = ''
  }

  const del = ({ detail: id }: { detail: string }) => {
    if (!socket) return
    socket.emit('del message', id)
  }
</script>

<div class="messenger">
  {#if loggedIn === true}
    <p class="center">
      <label for="mod">
        <input type="checkbox" id="mod" bind:checked={mod} /> Mod view
      </label>
      <button
        type="button"
        on:click={() => {
          dispatch('logout')
        }}>Se déconnecter</button
      >
    </p>
  {/if}

  <Messages {messages} on:delete={del} {mod} />

  {#if loggedIn === undefined}
    <p class="center">Chargement...</p>
  {:else if loggedIn === true}
    <form on:submit|preventDefault={send}>
      <input type="text" bind:value />
      <button>Envoyer</button>
    </form>
  {:else}
    <p class="center"><a href="/login">Se connecter</a></p>
  {/if}
</div>

<style lang="scss">
  .messenger {
    display: flex;
    flex: 1;
    flex-direction: column;
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