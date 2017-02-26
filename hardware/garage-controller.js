const Cylon = require('cylon')

const GarageController = Cylon.robot({
  connections: {
    spark: { adaptor: 'spark', accessToken: process.env.PARTICLE_ACCESS_TOKEN, deviceId: process.env.PARTICLE_DEVICE_ID }
  },

  devices: {
    servo: { driver: 'servo', pin: 'D1' }
  },

  commands: function() {
    return {
      open: this.open,
      close: this.close
    }
  },

  work: function() {},

  open(updateCallback) {
    this._moveTo(100, updateCallback)
  },

  close() {
    this._moveTo(0, updateCallback)
  },

  _moveTo(target, updateCallback) {
    let updateInterval = 100
    let location = null
    let error = null

    const onComplete = (err, data) => {
      error = error
      location = data
      updateCallback(data)
    }

    this.spark.command('moveTo', target, onComplete)

    const updateLocation = () => {
      if (error || location === target) {
        clearInterval(locationUpdating)
      } else {
        this.spark.variable('location', onComplete)
      }
    }

    const locationUpdating = setInterval(updateLocation, updateInterval)
  }
}).start()

module.exports = GarageController
