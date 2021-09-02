<script lang="ts">
  import type { Me } from '../api'
  import type { DetailedMessage, Team } from '../types'
  import { createEventDispatcher } from 'svelte'
  import { richText } from './Message.svelte'

  export let teams: Map<Team['id'], Team>
  export let me: Me | undefined
  export let message: DetailedMessage
  export let mod = false

  $: ({ body, author, deleted, visible } = message)
  $: ({
    color,
    name: teamName = '',
    code: teamCode = '',
  } = teams.get(author.teamId) ?? { color: '#fff', name: '', code: '' })

  const dispatch = createEventDispatcher<{ delete: void }>()
</script>

<p class:invisible={!visible} style="--color:{color}">
  {#if teamCode}
    <img src="/images/badges/{teamCode}.png" alt={teamName} />
  {:else}
    <span class="placeholder" />
  {/if}
  <strong>{author.name}</strong>{#if mod} ({author.inpId}){/if}:
  {#if deleted}
    {#if mod}
      <span use:richText={{ body, me }} class:deleted />
    {:else}
      <em>supprimé</em>
    {/if}
  {:else}
    <span use:richText={{ body, me }} />
  {/if}
  {#if mod}
    <button
      on:click={() => {
        dispatch('delete')
      }}
      type="button">X</button
    >
  {/if}
</p>

<style lang="scss">
  p {
    margin: 0;

    :global(mark) {
      padding: 0 0.125em;
      background-color: var(--color);
      border-radius: 0.25rem;
      box-decoration-break: clone;
      line-break: strict;
    }

    :global(.emoji) {
      width: 1em;
      height: 1em;
      margin: 0 0.05em 0 0.1em;
      vertical-align: -0.1em;
    }
  }

  img {
    width: 1.5em;
    height: 1.5em;
    vertical-align: bottom;
    background-color: var(--color);
    border-radius: 0.25rem;
  }

  strong {
    color: var(--color);
  }

  .placeholder {
    display: inline-block;
    width: 1.5em;
    height: 1.5em;
    vertical-align: bottom;
    background-color: var(--color);
    border-radius: 0.25rem;
  }

  .invisible {
    opacity: 0.5;
  }

  .deleted {
    text-decoration: line-through;
  }
</style>
