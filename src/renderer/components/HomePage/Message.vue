<template>
  <div class="message-container">
    <div>
      <span class="sender">{{myMessage ? 'Eu' : name}}:</span><span>  {{msg}}</span>
    </div>
  </div>
</template>
<script>
  export default {
    name: 'messages',
    props: ['message', 'clients', 'id'],
    data: () => {
      return {
        name: '',
        msg: '',
        myMessage: false
      }
    },
    mounted () {
      this.getSender()
    },
    methods: {
      getSender () {
        const { message: { message, senderId }, clients } = this
        clients.forEach(({ id, name }) => {
          if (senderId === id) {
            if (senderId === this.id) {
              this.myMessage = true
            }
            this.name = name
            this.msg = message
          }
        })
      }
    }
  }
</script>
<style>
  .message-container {
   margin: 5px;
  }
  .sender {
    font-weight: 600;
  }
</style>