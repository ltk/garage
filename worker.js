require('dotenv').config()

const Door = require('./api/models/door')
const queue = require('./shared/queue')
const Garage = require('./hardware/garage')

queue.process('doorCommand', function(job, done){
  doorCommand(job.data, done)
})

function doorCommand(jobData, done) {
  const operationDuration = 3.5 * 1000
  const command = jobData.command

  const inflectedCommand = inflectCommand(command)

  Door.fetch().then((door) => {
    if (command == door.status) {
      done()
    } else {
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

          Door.set({ status: inflectedCommand.complete, progress: 1 }).then(() => {
            console.log("Command Done:", inflectedCommand.complete)
            done()
          })
        } else {
          const progress = 1 - (operationCompleteAt - currentTime) / operationDuration

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
