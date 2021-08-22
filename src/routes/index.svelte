<script lang="ts">
  import { goto } from '$app/navigation'

  import type { Socket } from 'socket.io'
  import io from 'socket.io-client'
  import { onMount, tick } from 'svelte'

  let messages: Array<{ login: string; msg: string }> = []
  let value = ''
  let container: HTMLElement

  let socket: Socket | undefined

  onMount(() => {
    const token = sessionStorage.getItem('token')
    if (token === null) {
      goto('login')
      return
    }

    socket = io(':3001', {
      auth: { token },
    })

    socket.on('chat message', async function (msg) {
      messages = [...messages, msg]
      if (
        container.scrollTop >
        container.scrollHeight - container.clientHeight - 10
      ) {
        await tick()
        container.scrollTo({ top: container.scrollHeight })
      }
    })

    socket.on('disconnect', () => {
      location.href = 'login'
    })
  })

  const send = () => {
    socket.emit('chat message', value)
    value = ''
  }
</script>

<main>
  <div class="messages" bind:this={container}>
    {#each messages as { login, msg }}
      <p><strong>{login}:</strong> {msg}</p>
    {/each}
  </div>

  <form on:submit|preventDefault={() => send()}>
    <input type="text" bind:value />
    <button>Envoyer</button>
  </form>
</main>

<style lang="scss">
  :global(body) {
    // TODO: use sanitize.css
    margin: 0;
    color: #fff;
    background-color: rgb(41, 37, 65);
  }

  main {
    display: flex;
    flex-direction: column;
    height: 100vh;
  }

  .messages {
    display: flex;
    flex-direction: column;
    flex: 1;
    overflow: auto;
    padding: 0 1em;
    gap: 0.5rem;

    > :first-child {
      margin-top: auto;
    }

    > p {
      margin: 0;
    }
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
      border-radius: 0.5em;
      border: 1px solid rgb(24, 24, 27);
      background: #fff;

      &:focus {
        box-shadow: 0 0 3px #fff;
        outline: 0;
      }
    }
  }
</style>
