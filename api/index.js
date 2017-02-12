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
        var job = queue.create('doorCommand', {
          // TODO: input error handling
          command: request.payload.data.attributes.command
        }).save()

        reply(null).code(202)
      }
    })

    server.route({
      method:  'PUT',
      path:    '/api/door',
      handler: (request, reply) => {
        // TODO: input error handling
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
