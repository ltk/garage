require('dotenv').config()

const Door = require('./api/models/door')
const queue = require('./shared/queue')

queue.process('doorCommand', function(job, done){
  doorCommand(job.data, done)
})

// When the worker fires up, make sure door is in correct position.
Door.whenReady(() => {
  Door.close()
})

function doorCommand(jobData, done) {
  // const operationDuration = 5.4 * 1000
  const command = jobData.command
  if (Door.isValidCommand(command)) {
    Door[command]()
  }
}
