<script lang="ts">
  import { onMount } from 'svelte'

  let websocket: WebSocket | undefined
  let lastTime: number = Date.now()

  onMount(() => {
    websocket = new WebSocket('wss://gba.inpt.fr/')
  })

  const sendAction = (key: string) => () => {
    if (websocket) {
      const currentTime: number = Date.now()
      if (currentTime - lastTime > 500) {
        websocket.send(JSON.stringify({ action: key }))
        lastTime = currentTime
      }
    }
  }
</script>

<table class="buttons">
  <tr>
    <td colspan="2" id="l">
      <button on:click={sendAction('l')}>L</button>
    </td>
    <td />
    <td colspan="2" id="r">
      <button on:click={sendAction('r')}>R</button>
    </td>
  </tr>

  <tr>
    <td />
    <td id="up">
      <button on:click={sendAction('up')}> ∧ </button>
    </td>
    <td />
    <td id="select">
      <button on:click={sendAction('select')}> select </button>
    </td>
    <td id="start">
      <button on:click={sendAction('start')}> start </button>
    </td>
  </tr>

  <tr>
    <td id="left">
      <button on:click={sendAction('left')}> &lt; </button>
    </td>
    <td />
    <td id="right">
      <button on:click={sendAction('right')}> > </button>
    </td>
    <td />
    <td />
  </tr>

  <tr>
    <td />
    <td id="down">
      <button on:click={sendAction('down')}> ∨ </button>
    </td>
    <td />
    <td id="a">
      <button on:click={sendAction('a')}>A</button>
    </td>
    <td id="b">
      <button on:click={sendAction('b')}>B</button>
    </td>
  </tr>
</table>

<style lang="scss">
  * {
    margin: 0;
    padding: 0;
  }

  table {
    margin: auto;
    margin-top: 30vh;
  }
  @media (orientation: landscape) {
    button {
      width: 10vh;
      height: 10vh;
    }

    #start,
    #select,
    #l,
    #r {
      button {
        width: 20vh;
      }
    }

    #r,
    #l {
      padding-bottom: 10vh;
    }

    #right {
      padding-right: 15vh;
    }
  }

  @media (orientation: portrait) {
    button {
      width: 10vw;
      height: 10vw;
    }

    #start,
    #select,
    #l,
    #r {
      button {
        width: 20vw;
      }
    }

    #r,
    #l {
      padding-bottom: 10vw;
    }

    #right {
      padding-right: 15vw;
    }
  }

  td {
    text-align: center;
    &#r {
      text-align: right;
    }
    &#start,
    &#select,
    &#l,
    &#r {
      button {
        border-radius: 25%;
      }
    }

    &#left,
    &#right,
    &#up,
    &#down {
      button {
        border-radius: 10%;
      }
    }

    &#a,
    &#b {
      button {
        border-radius: 50%;
      }
    }
  }
</style>
