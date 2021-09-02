<script lang="ts">
  import type { Me } from '../api'
  import type { Team } from '../types'
  import type { Thread } from './types'
  import { afterUpdate, beforeUpdate, createEventDispatcher } from 'svelte'
  import MessageComponent from './Message.svelte'

  export let thread: Thread = []
  export let me: Me | undefined = undefined
  export let mod = false
  export let teams: Map<Team['id'], Team>

  const dispatch = createEventDispatcher<{ delete: number }>()

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
  {#each thread as item}
    {#if item.type === 'message'}
      <MessageComponent
        message={item.message}
        {teams}
        {me}
        {mod}
        on:delete={() => {
          dispatch('delete', item.message.id)
        }}
      />
    {:else if item.type === 'notice'}
      <div class="notice">{item.message}</div>
    {/if}
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

  .notice {
    color: #999;
  }
</style>
