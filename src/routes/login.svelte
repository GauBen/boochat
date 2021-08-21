<script lang="ts">
  let login = ''
  const submit = async () => {
    const response = await fetch(`//localhost:3001/api/login`, {
      method: 'POST',
      body: JSON.stringify({ login }),
      headers: { 'Content-Type': 'application/json' },
      // mode: 'no-cors',
    }).then((r) => r.json())
    if ('token' in response) {
      sessionStorage.setItem('token', response.token)
      location.href = '.'
    }
  }
</script>

<form on:submit|preventDefault={() => submit()}>
  <label for="login">Nom d'utilisateur :</label>
  <input type="text" id="login" bind:value={login} />
  <button>Se connecter</button>
</form>
