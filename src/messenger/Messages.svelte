<script lang="ts">
  import type { Me } from '../api'
  import type { Team } from '../types'
  import type { Thread } from './types'
  import { afterUpdate, beforeUpdate, createEventDispatcher } from 'svelte'
  import DetailedMessage from './DetailedMessage.svelte'
  import Message from './Message.svelte'
  import { Type } from './types'

  export let thread: Thread = []
  export let me: Me | undefined = undefined
  export let mod = false
  export let teams: Map<Team['id'], Team>

  const dispatch = createEventDispatcher<{ delete: number; restore: number }>()

  /** Main div. */
  let div: HTMLElement | undefined

  /** Number of pixels to reach the bottom. */
  let scroll = 0

  beforeUpdate(async () => {
    if (div) scroll = div.scrollHeight - div.clientHeight - div.scrollTop
  })

  afterUpdate(() => {
    if (div && scroll < 10) div.scrollTo({ top: div.scrollHeight })
  })
</script>

<div class="messages" bind:this={div}>
  {#each thread as item}
    {#if item.type === Type.Basic}
      <Message message={item.message} {teams} {me} />
    {:else if item.type === Type.Detailed}
      <DetailedMessage
        message={item.message}
        {teams}
        {me}
        {mod}
        on:delete={() => {
          dispatch('delete', item.message.id)
        }}
        on:restore={() => {
          dispatch('restore', item.message.id)
        }}
      />
    {:else if item.type === Type.Notice}
      <div class="notice">{item.message}</div>
    {/if}
  {/each}
</div>

<style lang="scss">
  .messages {
    display: flex;
    flex: 1;
    flex-direction: column;
    padding: 0 1em;
    overflow: auto;

    // `gap` is not supported by OBS webviews yet
    // gap: 0.5rem;
    > :global(*) {
      margin: 0.25rem 0 !important;
    }

    > :global(:first-child) {
      margin-top: auto !important;
    }
  }

  .notice {
    color: #999;
  }
</style>
