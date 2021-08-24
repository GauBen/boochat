<script lang="ts">
  import type { User } from 'src/user'
  import { afterUpdate, beforeUpdate, createEventDispatcher } from 'svelte'
  import Message from './Message.svelte'

  export let messages: Array<{ id: string; login: User; msg: string }> = []

  export let mod = false

  const dispatch = createEventDispatcher<{ delete: string }>()

  /** Main div. */
  let div: HTMLElement | undefined

  /** Number of pixels to reach the bottom. */
  let scroll = 0

  beforeUpdate(() => {
    if (div) scroll = div.scrollHeight - div.clientHeight - div.scrollTop
  })

  afterUpdate(() => {
    if (div && scroll < 10) div.scrollTo({ top: div.scrollHeight })
  })
</script>

<div class="messages" bind:this={div}>
  {#each messages as { id, login, msg } (id)}
    <Message
      {login}
      {msg}
      {mod}
      on:delete={() => {
        dispatch('delete', id)
      }}
    />
  {/each}
</div>

<style lang="scss">
  .messages {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 0.5rem;
    padding: 0 1em;
    overflow: auto;

    > :global(:first-child) {
      margin-top: auto;
    }
  }
</style>
