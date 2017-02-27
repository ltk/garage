const redis = require('redis')
const bluebird = require('bluebird')

const DoorCommands = require('../../shared/door-commands')
const GarageController = require('../../hardware/garage-controller')

const redisClient = redis.createClient({ prefix: 'garage-api', url: process.env.REDIS_URL })

bluebird.promisifyAll(redis.RedisClient.prototype)
bluebird.promisifyAll(redis.Multi.prototype)

const Door = {
  isValidCommand(command) {
    return Object.keys(DoorCommands).indexOf(command) !== -1
  },

  whenReady(callback) {
    GarageController.on('ready', callback)
  },

  fetch() {
    return Promise.all(this._attributeFetches()).then(([status, progress]) => {
      return { status, progress: parseFloat(progress) }
    })
  },

  open() {
    this._set({ status: DoorCommands.open.inProgress })

    GarageController.commands.open(this.update.bind(this))
  },

  close() {
    this._set({ status: DoorCommands.close.inProgress })

    GarageController.commands.close(this.update.bind(this))
  },

  update(data) {
    console.log('updating with', data.result)
    // TODO: how to map this to cleaned up data
    // this._set(data)

    const updateParams = {
      progress: data.result
    }

    Object.keys(DoorCommands).forEach((key) => {
      const command = DoorCommands[key]

      if (data.location === command.location) {
        updateParams.status = command.complete
      }
    })

    this._set(updateParams)
  },

  _set(attributes) {
    return Promise.all(Object.keys(attributes).map((attributeName) => {
      return redisClient.setAsync(this._keyForAttribute(attributeName), attributes[attributeName])
    }))

    return Promise.all(sets)
  },

  _attributeFetches() {
    return ['status', 'progress'].map((attributeName) => {
      return redisClient.getAsync(this._keyForAttribute(attributeName))
    })
  },

  _keyForAttribute(attributeName) {
    return `door-${attributeName}`
  }
}

module.exports = Door
