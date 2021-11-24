<script lang="ts">
  import { onMount } from 'svelte'
  import { get, GetRequest, post, PostRequest } from '../../api'
  import type { Socket } from '../../socket-api'
  import { ServerEvent } from '../../socket-api'
  import type { Team, User } from '../../types'
  import type { CurrentState } from './types'

  export let socket: Socket | undefined = undefined
  export let me: User & { team: Team }
  let state: CurrentState // | undefined, but TS does not handle nesting
  let disabled = false

  onMount(() => {
    void get(GetRequest.Connect3State).then(({ body }) => {
      state = body
      disabled = state.over
    })
  })

  let move = 3

  const listen = (socket: Socket | undefined) => {
    if (!socket) return

    socket.on(ServerEvent.Connect3NextTurn, (data) => {
      state = data
      disabled = state.over
    })
  }

  $: listen(socket)

  let playingTeam: Team
  $: if (state !== undefined)
    playingTeam = state.turns[state.turn % state.turns.length]
</script>

<form
  class="controller"
  on:submit|preventDefault={() => {
    disabled = true
    void post(PostRequest.Connect3Play, { move })
  }}
>
  {#if state === undefined}Chargement...{:else}
    <p class="turn">
      Tour de l'équipe <strong style="color: {playingTeam?.color}">
        {playingTeam?.name}
      </strong>
    </p>
    {#if me.teamId === playingTeam.id}
      <div class="row">
        <button
          type="button"
          on:click={() => {
            if (move > 0) move--
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"><path d="M3 12l18-12v24z" /></svg
          >
        </button>
        <span>{move + 1}</span>
        <button
          type="button"
          on:click={() => {
            if (move < state.grid[0].length - 1) move++
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"><path d="M21 12l-18 12v-24z" /></svg
          >
        </button>
      </div>
      <p>
        {#if disabled}
          <span class="button-placeholder">Vote enregistré</span>
        {:else}
          <button type="submit">Voter !</button>
        {/if}
      </p>
      <p><em>Le coup avec le plus de votes est choisi</em></p>
    {/if}
  {/if}
</form>

<style lang="scss">
  .controller {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    padding: 1rem;
    overflow: auto;
  }

  .turn {
    font-size: 1.5em;
  }

  .row {
    display: flex;
    gap: 1em;
    align-items: center;
    justify-content: center;

    > button {
      border: 0;
    }

    > span {
      font-weight: bold;
      font-size: 5em;
      line-height: 1;
    }
  }

  .button-placeholder {
    display: inline-block;
    padding: 0.5rem 0;
  }

  [type='submit'] {
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

    &:disabled {
      opacity: 0.5;
    }
  }
</style>
