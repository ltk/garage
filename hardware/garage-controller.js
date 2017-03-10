// =============================================================================
// To control an actual Photon, uncomment out the following `require`, add the
// following packages to package.json, and defined your device credentials in .env
//
// const Cylon = require('cylon')
//
// "cylon": "^1.3.0",
// "cylon-spark": "^0.21.1",
//
// =============================================================================

const DoorCommands = require('../shared/door-commands')

let GarageController

if (process.env.PARTICLE_ACCESS_TOKEN && process.env.PARTICLE_DEVICE_ID) {
  console.log("Particle credentials detected. You're controlling the real deal.")

  GarageController = Cylon.robot({
    connections: {
      spark: { adaptor: 'spark', accessToken: process.env.PARTICLE_ACCESS_TOKEN, deviceId: process.env.PARTICLE_DEVICE_ID }
    },

    commands: function() {
      return {
        open: this.open,
        close: this.close
      }
    },

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
} else {
  console.log("No Particle credentials detected. Using a software replica.")

  GarageController = {
    on(status, callback) {
      callback()
    },

    commands: {
      open(updateCallback, done) {
         const operationDuration = 10 * 1000
         const operationStartedAt = new Date().getTime()
         const operationCompleteAt = operationStartedAt + operationDuration


         const progressUpdater = setInterval(() => {
           const currentTime = new Date().getTime()

           if (currentTime > operationCompleteAt) {
             clearInterval(progressUpdater)

             console.log("Command Done:", DoorCommands.open.complete)
             updateCallback({ result: DoorCommands.open.location })
             done()
           } else {
             const progress = 1 - (operationCompleteAt - currentTime) / operationDuration

             console.log("Command Progress:", DoorCommands.open.inProgress, progress)
             updateCallback({ result: progress * (DoorCommands.open.location - DoorCommands.close.location) })
           }
         }, 50)
      },

      close(updateCallback, done) {
        console.log("close")
        const operationDuration = 10 * 1000
        const operationStartedAt = new Date().getTime()
        const operationCompleteAt = operationStartedAt + operationDuration


        const progressUpdater = setInterval(() => {
          const currentTime = new Date().getTime()

          if (currentTime > operationCompleteAt) {
            clearInterval(progressUpdater)

            console.log("Command Done:", DoorCommands.close.complete)
            updateCallback({ status: DoorCommands.close.complete, result: DoorCommands.close.location })
            done()
          } else {
            const progress = (operationCompleteAt - currentTime) / operationDuration

            console.log("Command Progress:", DoorCommands.close.inProgress, progress)
            updateCallback({ result: progress * (DoorCommands.open.location - DoorCommands.close.location) })
          }
        }, 50)
      }
    }
  }
}

module.exports = GarageController
