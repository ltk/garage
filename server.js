const Hapi = require('hapi')

require('dotenv').config()

const server = new Hapi.Server()

server.connection({
  host: process.env.API_HOST,
  port: process.env.API_PORT
})

server.register(require('./api'))

server.start((err) => {
  if (err) {
    throw err
  }

  console.log('Garage service serving from:', server.info.uri)
})
