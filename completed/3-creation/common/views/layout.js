import React from 'react'
import { Button, Text, View } from 'react-native'
import Progress from './progress'

import {
  POLL_TIME
} from '../../config'

import {
  getStatus,
  postCommand
} from '../actions'

import styles from './styles'

export default class Layout extends React.Component {

  state = {
    status: 'Unknown',
    progress: 0
  }

  halt () {
    if (this.request) {
      this.request.abort()
    }

    clearTimeout(this.timer)
  }

  delayedPing = () => {
    this.timer = setTimeout(this.ping, POLL_TIME)
  }

  ping = () => {
    this.halt()

    this.request = getStatus(status => {
      this.request = null

      // Delayed ping will get called once the React component has finished
      // reconciling the status state change
      this.setState(status, this.delayedPing)
    })
  }

  componentDidMount () {
    this.ping()
  }

  componentWillUnmount () {
    this.halt()
  }

  open = () => {
    return postCommand('open', this.ping)
  }

  close = () => {
    return postCommand('close', this.ping)
  }

  renderError () {
    return <Text>Error! {this.state.message}</Text>
  }

  render () {
    // We like to use const magic values, globals, and for properties not "owned"
    // by the current function
    const { error, status, progress } = this.state

    let shouldClose = status === 'open' || status === 'opening'

    return (
      <View style={styles.container}>
        <Text style={styles.header}>
          The Garage is {this.state.status}
        </Text>

        <View style={styles.main}>
          <Text>Progress</Text>
          <Progress progress={this.state.progress} />
          { error ? this.renderError() : null }
        </View>

        <View style={styles.footer}>
          <Button title={shouldClose ? 'Close' : 'Open'}
                  onPress={shouldClose ? this.close : this.open} />
        </View>
      </View>
    )
  }
}
