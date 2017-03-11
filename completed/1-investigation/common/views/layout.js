import React, { PureComponent } from 'react'
import { getStatus, postCommand } from '../actions'

class Layout extends PureComponent {
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
    this.timer = setTimeout(this.ping, 1000)
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

  open = () => {
    return postCommand('open', this.ping)
  }

  close = () => {
    return postCommand('close', this.ping)
  }

  render () {
    return (
      <div className="wrapper">
        <header>
          The Garage is {this.state.status}
        </header>
        <main>
          Progress:
          <p><progress value={this.state.progress} /></p>
        </main>
        <footer>
          <button onClick={this.open}>Open</button>
          <button onClick={this.close}>Close</button>
        </footer>
      </div>
    )
  }

}

export default Layout
