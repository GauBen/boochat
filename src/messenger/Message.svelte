<script lang="ts">
  import type { User } from '../entities'
  import { createEventDispatcher } from 'svelte'
  import twemoji from 'twemoji'

  export let mod = false
  export let author: User
  export let body: string

  const dispatch = createEventDispatcher<{ delete: void }>()

  const emoji = (node: HTMLElement) => {
    // eslint-disable-next-line import/no-named-as-default-member
    twemoji.parse(node, { folder: 'svg', ext: '.svg' })
  }
</script>

<p>
  <strong style="color:{author.team.color}">{author.name}:</strong>
  <span use:emoji>{body}</span>
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

    :global(.emoji) {
      width: 1em;
      height: 1em;
      margin: 0 0.05em 0 0.1em;
      vertical-align: -0.1em;
    }
  }
</style>
