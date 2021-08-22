<script lang="ts">
  import { goto } from '$app/navigation'

  let login = ''
  const submit = async () => {
    const response = await fetch(`//localhost:3001/api/login`, {
      method: 'POST',
      body: JSON.stringify({ login }),
      headers: { 'Content-Type': 'application/json' },
      // Mode: 'no-cors',
    }).then(async (r) => r.json())
    if ('token' in response) {
      sessionStorage.setItem('token', response.token)
      await goto('.')
    }
  }
</script>

<form on:submit|preventDefault={async () => submit()}>
  <label for="login">Nom d'utilisateur :</label>
  <input type="text" id="login" bind:value={login} />
  <button>Se connecter</button>
</form>
