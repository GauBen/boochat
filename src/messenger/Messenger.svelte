<script lang="ts">
  import type { Me, RichMessage } from '../api'
  import type {
    ClientToServerEvents,
    ServerToClientEvents,
  } from '../socket-api'
  import type { Thread } from './types'
  import type { Team, User } from '@prisma/client'
  import type { Socket } from 'socket.io-client'
  import { createEventDispatcher, onMount } from 'svelte'
  import { get, GetRequest, Level } from '../api'
  import { ClientEvent, ServerEvent } from '../socket-api'
  import Messages from './Messages.svelte'

  export let me: Me | undefined = undefined
  export let mod = false
  export let socket:
    | Socket<ServerToClientEvents, ClientToServerEvents>
    | undefined = undefined

  let thread: Thread = []

  $: if (thread.length > 1000) thread = thread.slice(-1000)

  $: messages = new Map(
    thread
      .filter(
        (item): item is { type: 'message'; message: RichMessage } =>
          item.type === 'message'
      )
      .map(({ message }) => [message.id, message])
  )

  $: for (const message of messages.values()) {
    const { author } = message
    if (!users.has(author.id)) users.set(author.id, author)

    const u = users.get(author.id)
    if (u) {
      message.author = u
      u.name = author.name
      u.team = author.team
    }
  }

  let value = ''

  const users = new Map<number, User & { team: Team }>()

  const dispatch = createEventDispatcher<{ logout: void; send: string }>()

  onMount(async () => {
    const { body } = await get(GetRequest.Messages)
    // Load messages above notices
    thread = [
      ...body.map((message) => ({ type: 'message' as const, message })),
      ...thread,
    ]
  })

  const listen = (
    socket: Socket<ServerToClientEvents, ClientToServerEvents> | undefined
  ) => {
    if (!socket) return

    socket.on(ServerEvent.Connected, () => {
      thread = [
        ...thread,
        { type: 'notice', message: 'Bienvenue sur Boochat !' },
      ]
    })

    socket.on(ServerEvent.DetailedMessage, async (message) => {
      thread = [...thread, { type: 'message', message }]
    })

    socket.on(ServerEvent.Message, async (message) => {
      if (messages.has(message.id)) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const m = messages.get(message.id)!
        m.body = message.body
        m.deleted = message.deleted
        m.visible = message.visible
        thread = thread
        return
      }

      thread = [...thread, { type: 'message', message }]
    })

    socket.on(ServerEvent.Notice, async (message) => {
      thread = [...thread, { type: 'notice', message }]
    })

    socket.on(ServerEvent.DeleteMessage, async (id) => {
      const m = messages.get(id)
      if (m) {
        m.deleted = true
        thread = thread
      }
    })
  }

  $: listen(socket)

  const send = () => {
    if (!socket) return
    socket.emit(ClientEvent.Message, value)
    value = ''
  }

  const del = ({ detail: id }: { detail: number }) => {
    if (!socket) return
    socket.emit(ClientEvent.DeleteMessage, id)
  }
</script>

<div class="messenger">
  {#if me}
    <p class="center">
      {#if me.level > Level.Chat}
        <label for="mod">
          <input type="checkbox" id="mod" bind:checked={mod} /> Mod view
        </label>
      {/if}
      <button
        type="button"
        on:click={() => {
          dispatch('logout')
        }}>Se déconnecter ({me.name})</button
      >
    </p>
  {/if}

  <Messages {thread} {me} {mod} on:delete={del} />

  {#if me === undefined}
    <p class="center">Chargement...</p>
  {:else if me}
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
