const Door = require('./models/door')
const queue = require('../shared/queue')

const API = {
  register: (server, options, next) => {
    server.register(require('@gar/hapi-json-api'))

    server.route({
      method:  'GET',
      path:    '/api/door',
      handler: (request, reply) => {
        Door.fetch().then((door) => {
          reply({
            type: 'doors',
            data: {
              attributes: door
            }
          })
        })
      }
    })

    server.route({
      method:  'POST',
      path:    '/api/door_commands',
      handler: (request, reply) => {
        let status = 400
        const command = request.payload.data.attributes.command
        console.log('Received command', command, Door.isValidCommand(command))

        if (Door.isValidCommand(command)) {
          const job = queue.create('doorCommand', { command }).save()

          if (job) {
            status = 202
          } else {
            // Our connection to redis is probably down.
            status = 503
          }
        }

        reply(null).code(status)
      }
    })

    server.route({
      method:  'PUT',
      path:    '/api/door',
      handler: (request, reply) => {
        // For setup/debugging only
        const attributes = request.payload.data.attributes

        Door.set(attributes).then(() => {
          reply({
            data: {
              attributes
            }
          })
        })
      }
    })

    next()
  }
}

API.register.attributes = {
  name: 'API',
  version: '1.0.0'
}

module.exports = API
