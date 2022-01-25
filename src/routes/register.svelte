<script lang="ts" context="module">
  import { goto } from '$app/navigation'
  import { get } from '$lib/api'
  import type { Load } from '@sveltejs/kit'
  import { PostRequest } from '../api'
  import { post } from '../fetch'
  import type { Team } from '../types'

  export const load: Load = async ({ fetch }) => ({
    props: {
      teams: await get('/api/teams.json', { fetch }),
    },
  })
</script>

<script lang="ts">
  export let teams: Team[] = []

  let name = ''
  let teamId = 0
  let error: string | undefined

  $: color = teams.find((team) => team.id === teamId)?.color ?? '#fff'

  const submit = async () => {
    const { body } = await post(PostRequest.Login, { name, teamId })
    if ('error' in body) {
      error = body.error ?? 'Le serveur a rencontré une erreur...'
      return
    }

    localStorage.setItem('token', body.token)
    await goto('/')
  }
</script>

<main style:--color={color}>
  <form on:submit|preventDefault={submit}>
    <h1>Créer un compte</h1>
    <p class="input-group">
      <label for="login">Nom d'utilisateur :</label>
      <input type="text" id="login" bind:value={name} />
    </p>
    {#if error !== undefined}<p>❌ {error}</p>{/if}
    <h2>Équipe</h2>
    <div class="teams">
      {#each teams.filter(({ pickable }) => pickable) as { id, name, color, code } (id)}
        <input
          type="radio"
          bind:group={teamId}
          value={id}
          id="team-{id}"
          name="team"
          required
        />
        <label for="team-{id}" style:--color={color}>
          <strong>{name}</strong>
          <img src="/images/teams/{code}.png" alt="" />
        </label>
      {/each}
    </div>
    <footer>
      <button>Créer</button>
    </footer>
  </form>
</main>

<style lang="scss">
  main {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    background-color: var(--color, white);
    transition: background-color 0.5s;
  }

  form {
    flex: 1;
    max-width: 3 * 8rem + 6rem;
    margin: 1rem;
    padding: 1rem 2rem;
    color: white;
    background: #222;
    border-radius: 0.25rem;
    box-shadow: 0 0 3rem rgba(0, 0, 0, 0.5), 0 0 1rem rgba(0, 0, 0, 0.2);
  }

  h1 {
    margin: 1rem 0 2rem;
    padding-block-end: 2rem;
    text-align: center;
    border-block-end: 1px solid #bbb;
  }

  h2 {
    margin: 2rem 0 1rem;
  }

  footer {
    margin: 3rem 0 1rem;
    padding-block-start: 2rem;
    border-block-start: 1px solid #bbb;
    text-align: center;

    > button {
      padding: 0.5rem 2rem;
      color: #222;
      font-weight: bold;
      background: linear-gradient(110deg, var(--color) 50%, #ccc 50.1%);
      background-position: 100% 100%;
      background-size: 250% 100%;
      border: 0;
      border-radius: 0.25rem;
      transition: background-position 0.5s, box-shadow 0.5s;

      &:hover,
      &:focus {
        background-position: 0% 100%;
        box-shadow: 0 0 0.5rem var(--color);
      }
    }
  }

  .input-group {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;

    > label {
      font-weight: bold;
      font-size: 0.75rem;
      text-transform: uppercase;
    }

    > input {
      justify-self: stretch;
      border: 1px solid #bbb;
      border-radius: 0.25rem;

      &:focus {
        background-color: #333;
        box-shadow: 0 0 0.5rem #fff;
      }

      &:hover {
        background-color: #333;
      }
    }
  }

  /* stylelint-disable no-descending-specificity */

  .teams {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(8rem, 1fr));
    gap: 1rem;
    align-items: center;
    justify-content: space-evenly;

    > input {
      position: absolute;
      height: 0;
      overflow: hidden;
      opacity: 0;

      &:focus + label > img {
        box-shadow: 0 0 0.5rem var(--color);
      }

      &:checked + label {
        transform: scale(1.125);
      }
    }

    > label {
      display: flex;
      flex-direction: column;
      align-items: center;
      color: var(--color);
      transition: transform 0.2s;

      > img {
        width: 100%;
        height: 8rem;
        padding: 0.5rem;
        object-fit: contain;
        background-color: var(--color);
        border-radius: 0.25rem;
        transition: box-shadow 0.5s;
      }

      &:hover > img {
        box-shadow: 0 0 0.5rem var(--color);
      }
    }
  }
</style>
