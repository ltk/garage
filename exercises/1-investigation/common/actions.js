import xhr from 'xhr'
import { resolve } from 'url'

const API_URL = process.env.API_URL

export function getStatus (callback) {
  let url = resolve(API_URL, 'api/door')

  return xhr.get({ url, json: true }, (error, _, body) => {
    if (error) {
      return console.error('Error', error)
    }

    callback(body.data.attributes)
  })
}

export function postCommand (command, callback) {
  let url = resolve(API_URL, 'api/door_commands')

  let body = {
    data: {
      type: 'doorCommands',
      attributes: { command }
    }
  }

  return xhr.post({ url, body, json: true }, (error, xhr, body) => {
    if (error) {
      return console.error('Error', error)
    }

    callback()
  })
}
