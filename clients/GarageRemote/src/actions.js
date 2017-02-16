import xhr from 'xhr'
import { resolve } from 'url'

const API_URL = "http://localhost:8000"

export function getStatus (callback) {
  let url = resolve(API_URL, 'api/door')

  return xhr.get({ url, json: true }, (error, response, body) => {
    if (error) {
      return console.error('Error', error)
    } else if (response.statusCode >= 400) {
      return console.error('Error:', body)
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

  return xhr.post({ url, body, json: true }, (error, response, body) => {
    if (error) {
      return console.error('Error', error)
    } else if (response.statusCode >= 400) {
      return console.error('Error:', body)
    }

    callback()
  })
}
