const redis = require('redis')
const bluebird = require('bluebird')

const DoorCommands = require('../../shared/door-commands')
const GarageController = require('../../hardware/garage-controller')

const redisClient = redis.createClient({ prefix: 'garage-api', url: process.env.REDIS_URL })

bluebird.promisifyAll(redis.RedisClient.prototype)
bluebird.promisifyAll(redis.Multi.prototype)

module.exports = {
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

  open(done) {
    this.fetch().then((door) => {
      if (door.status !== DoorCommands.open.complete) {
        this._set({ status: DoorCommands.open.inProgress })

        return GarageController.commands.open(this.update.bind(this), () => {
          this._set({ status: DoorCommands.open.complete })
          done()
        })
      } else {
        done()
      }
    })
  },

  close(done) {
    this.fetch().then((door) => {
      if (door.status !== DoorCommands.close.complete) {
        this._set({ status: DoorCommands.close.inProgress })

        return GarageController.commands.close(this.update.bind(this), () => {
          this._set({ status: DoorCommands.close.complete })
          done()
        })
      } else {
        done()
      }
    })
  },

  update(data) {
    try {
      const progress = data.result / 100.0
      const updateParams = { progress }

      this._set({ progress })
    } catch (error) {
      console.log("Caught error:", error)
    }
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
