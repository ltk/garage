require('dotenv').config()

const Door = require('./api/models/door')
const queue = require('./shared/queue')

Door.whenReady(() => {
  queue.process('doorCommand', function(job, done){
    doorCommand(job.data, done)
  })
})

function doorCommand(jobData, done) {
  const command = jobData.command
  if (Door.isValidCommand(command)) {
    Door[command](done)
  }
}
