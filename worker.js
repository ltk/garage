const kue = require('kue')

require('dotenv').config()

const queue = kue.createQueue()

queue.process('doorCommand', function(job, done){
  doorCommand(job.data, done)
})

function doorCommand(jobData, done) {
  // Open or close the door. Update on progress.
  // Progress docs: https://github.com/Automattic/kue#updating-progress
  console.log('Executing command:', jobData.command)

  done()
}

kue.app.listen(process.env.KUE_PORT)
