<script lang="ts">
  let value = ''

  let request: Promise<unknown> | undefined

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
