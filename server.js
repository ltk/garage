const Hapi = require('hapi')

require('dotenv').config()

const server = new Hapi.Server()

server.connection({
  port: process.env.API_PORT,
  routes: { cors: true }
})

server.register(require('./api'))

server.start((err) => {
  if (err) {
    throw err
  }

  console.log('Garage service serving from:', server.info.uri)
})
