import React from 'react'
import { Button, Text, View } from 'react-native'
import Progress from './progress'

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
    this.timer = setTimeout(this.ping, 500)
  }

  ping = () => {
    this.halt()

    this.request = getStatus(status => {
      this.request = null
      this.setState(status, this.delayedPing)
    })
  }

  componentDidMount () {
    this.ping()
  }

  componentWillUnmount () {
    this.halt()
  }

  render () {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>
          The Garage is {this.state.status}
        </Text>

        <View style={styles.main}>
          <Text>Progress</Text>
          <Progress progress={this.state.progress} />
        </View>

        <View style={styles.footer}>
          <Button title="Open" onPress={() => postCommand('open', this.ping)} />
          <Button title="Close" onPress={() => postCommand('close', this.ping)} />
        </View>
      </View>
    )
  }
}
