require('dotenv').config()

const Door = require('./api/models/door')
const queue = require('./shared/queue')
const Garage = require('./hardware/garage')

queue.process('doorCommand', function(job, done){
  doorCommand(job.data, done)
})

// When the worker fires up, make sure door is in correct position.
Door.fetch().then((door) => {
  Garage.on("ready", (garage) => {
    console.log("READY!", door)
    if (door.status == "open") {
      garage.commands.open(garage)
    } else {
      garage.commands.close(garage)
    }
  })
})


function doorCommand(jobData, done) {
  const operationDuration = 5.4 * 1000
  const command = jobData.command

  const inflectedCommand = inflectCommand(command)

  Door.fetch().then((door) => {
    if (command == door.status) {
      done()
    } else {
      const opening = command == "open"
      const finalProgress = opening ? 0 : 1
      const progressMultiplier = opening ? -1 : 1
      const operationStartedAt = new Date().getTime()
      const operationCompleteAt = operationStartedAt + operationDuration

      try {
        if (inflectedCommand.complete == 'open') {
          Garage.commands.open(Garage)
        } else {
          Garage.commands.close(Garage)
        }
      } catch(err) {
        console.log(err)
      }

      const progressUpdater = setInterval(() => {
        const currentTime = new Date().getTime()

        if (currentTime > operationCompleteAt) {
          clearInterval(progressUpdater)


          Door.set({ status: inflectedCommand.complete, progress: finalProgress }).then(() => {
            console.log("Command Done:", inflectedCommand.complete)
            done()
          })
        } else {
          const progress = finalProgress - (((operationCompleteAt - currentTime) / operationDuration) * progressMultiplier)

          Door.set({ status: inflectedCommand.inProgress, progress }).then(() => {
            console.log("Command Progress:", inflectedCommand.inProgress, progress)
          })
        }
      }, 100)
    }
  })
}

function inflectCommand(command) {
  switch (command) {
  case 'open':
    return {
      inProgress: 'opening',
      complete:   'open'
    }
    break
  case 'close':
    return {
      inProgress: 'closing',
      complete:   'closed'
    }
    break
  default:
    return {
      inProgress: `${command}ing`,
      complete:   `${command}ed`
    }
  }
}
