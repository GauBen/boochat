<script lang="ts">
  import { goto } from '$app/navigation'

  let login = ''
  let color = '#11CCEE'

  const submit = async () => {
    const response = await fetch(`//localhost:3001/api/login`, {
      method: 'POST',
      body: JSON.stringify({ login, color }),
      headers: { 'Content-Type': 'application/json' },
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
  <input type="color" bind:value={color} />
  <button>Se connecter</button>
</form>

<style>
  form {
    padding: 1em;
  }

  input[type='color'] {
    height: 34px;
    vertical-align: bottom;
  }
</style>
