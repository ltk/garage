import React, { PureComponent } from 'react'
import { getStatus, postCommand } from '../actions'

const POLL_TIME = parseInt(process.env.POLL_TIME || 1000)

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
    return <p>Error! {this.state.message}</p>
  }

  render () {
    // We like to use const magic values, globals, and for properties not "owned"
    // by the current function
    const { error, status, progress } = this.state

    let shouldClose = status === 'opening' || status === 'opening'

    return (
      <div className="wrapper">
        <header>
          The Garage is {status}
        </header>
        <main>
          Progress:
          <p><progress value={progress} /></p>
          { error ? this.renderError() : null }
        </main>
        <footer>
          <button onClick={shouldClose ? this.close : this.open}>
            {shouldClose ? 'Close' : 'Open'}
          </button>
        </footer>
      </div>
    )
  }

}

export default Layout
