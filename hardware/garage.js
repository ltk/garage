const Cylon = require('cylon')

const Garage = Cylon.robot({
  connections: {
    spark: { adaptor: 'spark', accessToken: process.env.PARTICLE_ACCESS_TOKEN, deviceId: process.env.PARTICLE_DEVICE_ID }
  },

  events: ['opened', 'closed'],

  commands: function() {
    return {
      open: this.open,
      close: this.close
    }
  },

  work: function(my) {
    // TODO: keep track of state
  },

  open(my) {
    console.log(arguments)
    my.spark.command("garage", "open", (err, data) => {
      console.log("opened", data)
      this.emit('opened', { data: data });
      // open = !!data.return_value
    })
  },

  close(my) {
    my.spark.command("garage", "close", (err, data) => {
      console.log("closed", data)
      this.emit('closed', { data: data });
      // open = !!data.return_value
    })
  }
}).start()

module.exports = Garage
