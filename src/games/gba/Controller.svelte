<script>
  const websocket = new WebSocket('ws://localhost:6789/')

  const sendAction = (key) => () => {
    websocket.send(JSON.stringify({ action: key }))
  }
</script>

<table class="buttons">
  <tr>
    <td colspan="2" style="padding-bottom: 1rem;"
      ><button id="l" on:click={sendAction('l')}>L</button></td
    >
    <td />
    <td colspan="2" style="padding-bottom: 1rem; text-align: right;"
      ><button id="r" on:click={sendAction('r')}>R</button></td
    >
  </tr>
  <tr>
    <td />
    <td><button id="up" on:click={sendAction('up')}> ∧ </button></td>
    <td />
    <td
      ><button id="select" on:click={sendAction('select')}> select </button></td
    >
    <td><button id="start" on:click={sendAction('start')}> start </button></td>
  </tr>
  <tr>
    <td><button id="left" on:click={sendAction('left')}> &lt; </button></td>
    <td />
    <td style="padding-right: 3rem;"
      ><button id="right" on:click={sendAction('right')}> > </button></td
    >
    <td />
    <td />
  </tr>
  <tr>
    <td />
    <td><button id="down" on:click={sendAction('down')}> ∨ </button></td>
    <td />
    <td><button id="a" on:click={sendAction('a')}>A</button></td>
    <td><button id="b" on:click={sendAction('b')}>B</button></td>
  </tr>
</table>

<style>
  * {
    margin: 0;
    padding: 0;
  }

  table {
    margin: auto;
    margin-top: 30vh;
  }

  td {
    text-align: center;
  }

  #a,
  #b {
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
  }

  #left,
  #right,
  #up,
  #down {
    width: 2rem;
    height: 2rem;
    border-radius: 10%;
  }

  #start,
  #select,
  #l,
  #r {
    width: 3.5rem;
    border-radius: 25%;
  }
</style>
