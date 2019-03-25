<template>
  <div>
    <div id="wrapper">
      <div class="container" v-if="stage === 'connect'">
        <h5>Digite o ip que deseja conectar</h5>
        <input class="input-text" v-bind:class="{valid: ipValid, invalid: ipValid === false}" type="text" v-model="ip">
        <div class="button" v-on:click="validIp" >Conectar</div>
      </div>
      <div class="container" v-if="stage === 'changeName'">
        <h5>Digite o seu nome</h5>
        <input class="input-text" v-bind:class="{valid: nameValid, invalid: nameValid === false}" type="text" v-model="name">
        <div class="button" v-on:click="validName" >Entrar</div>
      </div>
      <div id="chat-container" v-if="stage === 'chat'">
        <div id="title">
          <h2>Seja bem vindo ao Chat da Disciplina de Redes {{name}}</h2>
        </div>
        <div class="flex">
          <div>
            <div id="chat">
              <div id="message" v-for="message in messages">
                <Message v-bind:message="message" v-bind:clients="clients" v-bind:id="id" />
              </div>
            </div>
            <div id="writer-conteiner">
              <input v-on:keydown="keyDownMessage" type="text" id="writer" v-model="message" placeholder="Digite algo aqui...">
              <div class="button" v-on:click="sendMessage">Enviar</div>
            </div>
          </div>
          <div>
            <div id="info-container">
              <div id="info-title">
                <h4>Clientes Conectados</h4>
              </div>
              <div id="info-clients">
                <span v-for="client in clients" class="client-span">{{ client.name }}</span>
              </div>
              <div id="disconnect-button" v-on:click="disconnect">
                Desconectar
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import Message from './HomePage/Message'

  export default {
    name: 'home-page',
    el: '#wrapper',
    components: {
      Message
    },
    data: () => {
      return {
        stage: 'connect',
        ip: 'localhost:3001',
        ipValid: null,
        id: null,
        name: '',
        message: '',
        nameValid: null,
        connected: false,
        connecting: false,
        client: {},
        clients: [],
        messages: []
      }
    },
    methods: {
      keyDownMessage (e) {
        if (e.key === 'Enter') {
          this.sendMessage()
        }
      },
      validIp () {
        const { ip, connecting } = this
        if (!connecting) {
          if (ip === '') {
            this.ipValid = false
          } else {
            this.connecting = true
            this.ipValid = true
            this.connect()
          }
        }
      },
      async validName () {
        const { name } = this
        if (name === '') {
          this.nameValid = false
        } else {
          this.nameValid = true
          await this.setUserName(name)
        }
      },
      clientFunctions () {
        try {
          this.client.on('data', (data) => {
            console.log(data.toString())
            const { type, clients, id, message, messages, senderId } = JSON.parse(data)
            switch (type) {
              case 'message':
                this.messages.push({ senderId, message })
                break
              case 'updateClients':
                this.clients = clients
                break
              case 'attributes':
                this.id = id
                this.messages = messages
                break
            }
          })
          this.client.on('error', (err) => {
            console.log('Error ->', err)
            this.disconnect()
          })
        } catch (e) {
          console.log('error ->', e)
        }
      },
      async setUserName (name) {
        await this.client.write(JSON.stringify({
          type: 'changeName',
          name
        }))
        this.getPreviousMessages()
        this.stage = 'chat'
      },
      async sendMessage () {
        const { message } = this
        if (message !== '') {
          await this.client.write(JSON.stringify({
            type: 'message',
            message
          }))
          this.message = ''
        }
      },
      async getPreviousMessages () {
        await this.client.write(JSON.stringify({
          type: 'getPreviousMessages'
        }))
      },
      disconnect () {
        this.client.end()
        this.stage = 'connect'
        this.ip = 'localhost:3001'
        this.ipValid = null
        this.id = null
        this.name = ''
        this.message = ''
        this.nameValid = null
        this.connected = false
        this.connecting = false
        this.client = {}
        this.clients = []
        this.messages = []
      },
      connect () {
        this.connecting = true
        const net = require('net')
        const [host, port] = this.ip.split(':')
        try {
          const client = net.createConnection({ port, host }, () => {
            this.client = client
            this.clientFunctions()
            this.connected = true
            this.stage = 'changeName'
          })
        } catch (e) {
          console.log(e)
        }
      }
    }
  }
</script>

<style>
  @import url('https://fonts.googleapis.com/css?family=Source+Sans+Pro');

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    font-family: 'Source Sans Pro', sans-serif;
  }

  #info-title {
    padding: 10px;
    text-align: center;
    border-bottom: 1px solid white;
  }

  #info-container {
    width: 15vw;
    display: flex;
    flex-direction: column;
    background-color: #36393F;
    height: 100%;
    margin: 0 10px;
    border-radius: 5px;
  }

  #info-clients {
    display: flex;
    flex-direction: column;
    flex: 1;
  }

  #wrapper {
    height: 100vh;
    padding: 60px 80px;
    width: 100vw;
    background-color: #202225;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: row;
  }

  #wrapper-1 {
    display: flex;
  }

  #wrapper-2 {
    display: flex;
    flex: 1;
    height: 80vh;
  }

  main {
    display: flex;
    justify-content: space-between;
  }

  main > div {
    flex-basis: 50%;
  }

  #title {
    margin-bottom: 50px;
    text-align: center;
  }

  .flex {
    display: flex;
  }

  .container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .input-text {
    margin: 5px;
    padding: 10px 50px;
    border-radius: 5px;
    text-align: center;
    border: 1px solid gray;
  }

  .button {
    margin: 10px;
    padding: 10px 30px;
    border-radius: 10px;
    cursor: pointer;
    background-color: #7032FF;
    color: white;
  }

  #chat {
    background-color: #36393F;
    height: 60vh;
    width: 70vw;
    overflow-y: auto;
    padding: 10px;
    border-radius: 10px;
  }

  #message {
    color: white;
  }

  .valid {
    border-color: green !important;
  }

  .invalid {
    border-color: red !important;
  }

  #writer-conteiner {
    display: flex;
    background-color: #36393F;
    width: 70vw;
    margin-top: 10px;
    border-radius: 10px;
  }

  #writer {
    flex: 1;
    background-color: transparent;
    border: 0;
    min-height: 40px;
    padding: 0 10px;
    outline: none;
    color: white;
  }

  .client-span {
    margin: 10px;
    text-align: center;
  }

  #disconnect-button {
    padding: 15px;
    font-weight: 400;
    text-align: center;
    cursor: pointer;
    background-color: #7032FF;
  }
</style>
