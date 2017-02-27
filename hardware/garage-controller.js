const Cylon = require('cylon')

const DoorCommands = require('../shared/door-commands')

let GarageController

if (process.env.PARTICLE_ACCESS_TOKEN && process.env.PARTICLE_DEVICE_ID) {
  GarageController = Cylon.robot({
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
      this._moveTo(DoorCommands.open.location, updateCallback)
    },

    close() {
      this._moveTo(DoorCommands.close.location, updateCallback)
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
} else {
  console.log("No Particle credentials detected. Using a software replica.")

  GarageController = {
    on(status, callback) {
      callback()
    },

    commands: {
      open(updateCallback) {
         const operationDuration = 10 * 1000
         const operationStartedAt = new Date().getTime()
         const operationCompleteAt = operationStartedAt + operationDuration


         const progressUpdater = setInterval(() => {
           const currentTime = new Date().getTime()

           if (currentTime > operationCompleteAt) {
             clearInterval(progressUpdater)

             console.log("Command Done:", DoorCommands.open.complete)
             updateCallback({ location: DoorCommands.open.location })
           } else {
             const progress = 1 - (operationCompleteAt - currentTime) / operationDuration

             console.log("Command Progress:", DoorCommands.open.inProgress, progress)
             updateCallback({ location: progress * 100 })
           }
         }, 50)
      },

      close(updateCallback) {
        console.log("close")
        const operationDuration = 10 * 1000
        const operationStartedAt = new Date().getTime()
        const operationCompleteAt = operationStartedAt + operationDuration


        const progressUpdater = setInterval(() => {
          const currentTime = new Date().getTime()

          if (currentTime > operationCompleteAt) {
            clearInterval(progressUpdater)

            console.log("Command Done:", DoorCommands.close.complete)
            updateCallback({ status: DoorCommands.close.complete, location: DoorCommands.close.location })
          } else {
            const progress = (operationCompleteAt - currentTime) / operationDuration

            console.log("Command Progress:", DoorCommands.close.inProgress, progress)
            updateCallback({ location: progress * 100 })
          }
        }, 50)
      }
    }
  }
}

module.exports = GarageController
