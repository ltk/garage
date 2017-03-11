const Cylon = require('cylon')

const DoorCommands = require('../shared/door-commands')

const GarageController = Cylon.robot({
  connections: {
    spark: {
      adaptor: 'spark',
      accessToken: process.env.PARTICLE_ACCESS_TOKEN,
      deviceId: process.env.PARTICLE_DEVICE_ID
    }
  },

  commands: function() {
    return {
      open: this.open,
      close: this.close
    }
  },

  // The default Cylon loop
  work: function() {},

  open(updateCallback, done) {
    this._moveTo(DoorCommands.open.location, updateCallback, done)
  },

  close(updateCallback, done) {
    this._moveTo(DoorCommands.close.location, updateCallback, done)
  },

  _moveTo(target, updateCallback, done) {
    let updateInterval = 100
    let location = null
    let error = null

    const onComplete = (err, data) => {
      error = err
      location = data.result
      updateCallback(data)
    }

    this.spark.command('moveTo', target)

    const updateLocation = () => {
      try {
        if (error || location === target) {
          clearInterval(locationUpdating)
          done()
        } else {
          this.spark.variable('current', onComplete)
        }
      } catch(error) {
        console.log("Caught error:", error)
      }
    }

    const locationUpdating = setInterval(updateLocation, updateInterval)
  }
}).start()

module.exports = GarageController
