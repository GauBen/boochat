<script lang="ts">
  import { onMount } from 'svelte'

  let value = ''

  let request: Promise<unknown> | undefined

  onMount(() => {
    fetch('//localhost:3001/api/game-settings')
      .then(async (r) => r.json())
      .then((x) => {
        value = x.value
      })
      .catch((error) => {
        console.error(error)
      })
  })

  const send = () => {
    request = fetch('//localhost:3001/api/setup-game', {
      method: 'POST',
      body: JSON.stringify({ value }),
      headers: { 'Content-Type': 'application/json' },
    }).catch((error) => {
      console.error(error)
    })
  }
</script>

<form on:submit|preventDefault={send}>
  <p>
    <label for="question">Question:</label>
    <input type="text" id="question" bind:value />
  </p>
  <p>
    <button>Envoyer</button>
    {#if request}
      {#await request}Chargement...{:then}Updaté !{/await}
    {/if}
  </p>
</form>
