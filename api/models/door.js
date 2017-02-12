const redis = require('redis')
const bluebird = require('bluebird')
const redisClient = redis.createClient({ prefix: 'garage-api', url: process.env.REDIS_URL })

bluebird.promisifyAll(redis.RedisClient.prototype)
bluebird.promisifyAll(redis.Multi.prototype)

const Door = {
  fetch() {
    return Promise.all(this._attributeFetches()).then(([status, progress]) => {
      return { status, progress: parseFloat(progress) }
    })
  },

  set(attributes) {
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
