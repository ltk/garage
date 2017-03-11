const Hapi = require('hapi')

require('dotenv').config()

const server = new Hapi.Server()

server.connection({
  port: (process.env.PLATFORM === 'heroku' ? process.env.PORT : process.env.API_PORT),
  routes: { cors: true }
})

server.register(require('./routes'))

server.start((err) => {
  if (err) {
    throw err
  }

  console.log('Garage service serving from:', server.info.uri)
})
