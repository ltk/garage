# Second Exercise: Changes

Now that we've walked thorugh the specifics of the project setup,
let's make some changes.

Boot up the second example:

```bash
cd exercises/2-changing

yarn install

yarn start:web

# In another tab
yarn start:desktop
```

## One button to rule them all

Our current application has two buttons: one to open the garage, another to
close it. However we can never do them at the same time. Pixels are cheap, but
what garage remote manufacturer would put two buttons when they can just have
one for half the cost?

Let's take a look at `common/actions.js`. This file to keeps track of
all of our API commands. There are a few things worth pointing out:

```javascript
import { resolve } from 'url'

const API_URL = process.env.API_URL

export function getStatus (callback) {
  let url = resolve(API_URL, 'api/door')
  // ...
}

export function postCommand (command, callback) {
  let url = resolve(API_URL, 'api/door_commands')
  // ...
}
```

We're pulling in location of the API by using an environment variable. For the
web, we've added an entry for it in our `webpack.config.js`. For desktop, we
just require our configuration options directly using the [`dotenv` package](https://www.npmjs.com/package/dotenv).

### Data

Our app frequently pings the server for the status of the garage using a technique
called [long polling](https://www.pubnub.com/blog/2014-12-01-http-long-polling/).
No fancy web sockets, but garages aren't fancy.

The data payload for the status API endpoint looks like this:

```javascript
{
  "type": "doors",
  "data": {
    "attributes": {
      "status": "open",
      "progress": 1
    }
  }
}
```

Let's use this information to consolidate the button behaviors. This gives us
an excuse to dig into some React code, which will be useful for the next exercise.

### Changing the view layer

Our application has one view component: `common/views/layout.js`. This is a [React
component](https://facebook.github.io/react/docs/react-component.html) responsible
for sending out commands to the garage and tracking their progress.

Open up `common/views/layout.js`. Take a look at the render method:

```javascript
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
```

A React component can keep track of information using `this.state`. Here, we
access to pieces of information that the `layout.js` component tracks: `status`
and `progress`. These come directly from the garage status API endpoint.

Clicking around the UI, you'll notice there are a couple of states:

1. open
2. opening
3. closed
4. closing

Let's use this information to consolidate the button into a single element:

```javascript
render () {
  let shouldClose = this.state.status === 'open' || this.state.status === 'opening'

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
        <button onClick={shouldClose ? this.close : this.open}>
          {shouldClose ? 'Close' : 'Open'}
        </button>
      </footer>
    </div>
  )
}
```

All of the calls to `this.state` are a little pendantic. Let's use destructuring
to make things a bit more concise:

```javascript
render () {
  // We like to use const for magic values, globals, and for properties not "owned"
  // by the current function
  const { status, progress } = this.state

  let shouldClose = status === 'open' || status === 'opening'

  return (
    <div className="wrapper">
      <header>
        The Garage is {status}
      </header>
      <main>
        Progress:
        <p><progress value={progress} /></p>
      </main>
      <footer>
        <button onClick={shouldClose ? this.close : this.open}>
          {shouldClose ? 'Close' : 'Open'}
        </button>
      </footer>
    </div>
  )
}
```

Nice! Now that we've gotten a taste of working with JSX, let's move on to bigger
fish.

## Long polling can be slow

As we mentioned before, we're using long polling to get the status of the garage
door. Long polling is simple, but it can be a little slow to respond. We want
our garage door opener to be snappy. Let's bump up the polling value.

Taken a look at `delayedPing` in `layout.js`:

```javascript
delayedPing = () => {
  this.timer = setTimeout(this.ping, 1000)
}
```

Let's crank this up to 500ms bumping the timeout's second argument to 500:

```javascript
delayedPing = () => {
  this.timer = setTimeout(this.ping, 500)
}
```

Much faster!

## Environment variables

Pushing the button, we'll now start to see the progress updates at a faster
interval. However this means twice as many HTTP requests. This might not be
great for every environment, so let's make it configurable.

Let's move this value to the .env environment variable configuration file. Take
a look at .env at the root of the project:

```bash
API_URL=http://localhost:8000
CLIENT_PORT=4000
```

These values get pulled in to each platform's build setup. Let's add an entry
for the polling interval:

```bash
API_URL=http://localhost:8000
CLIENT_PORT=4000
POLL_TIME=500
```

And let's reference that in `layout.js`:

```javascript
import React, { PureComponent } from 'react'
import { getStatus, postCommand } from '../actions'

const POLL_TIME = parseInt(process.env.POLL_TIME || 1000, 10)

// ... then inside of delayedPing:
  delayedPing = () => {
    this.timer = setTimeout(this.ping, POLL_TIME)
  }
// .. rest of component

}

export default Layout
```

This should be all we need for Electron, which has direct access to
`process.env` as a part of supporting the full NodeJS API. However we need to
be more selective about what environment variables we expose to the web. Webpack
can expose global values using the `Define` plugin. Let's add a new configuration
for the POLL_TIME variable:

```javascript
// web/webpack.config.js
// ...
require('dotenv').config({ path: './.env' })

module.exports = function (env) {
  // ...
  return {
    // ...
    plugins: [
      new Webpack.DefinePlugin({
        process: {
          env: {
            NODE_ENV  : JSON.stringify(IS_DEV ? 'development' : 'production'),
            API_URL   : JSON.stringify(process.env.API_URL),
            POLL_TIME : JSON.stringify(process.env.POLL_TIME)
          }
        }
      })
    ]
    //...
  }
}
```

For both platforms, you'll need to restart your build process to observe the change.

## Polish

We have a responsive polling system and a streamlined button user experience,
however we don't have any error handling to think of. Let's fix that!

We'll keep things dead simple, so that we can move on to the final exercise.
The  API requests happening within `layout.js` should receive an error response
if something goes wrong. Let's force that to happen by changing our API_URL
environment variable:

```bash
# .env
API_URL=bogus
```

After rebooting your build process, let's crack open `layout.js` and address
the issue:

```javascript
// common/views/layout.js...
renderError () {
  return <p>Error! {this.state.message}</p>
}

render () {
  const { error, status, progress } = this.state

  let shouldClose = status === 'open' || status === 'opening'

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
```

Whenever an error is set, it will now display in the UI. The ternary we've added
to Layout's render method will return null if there is no error, which tells
React not to render anything.

## Moving on

We've learned a few things in this exercise: how to work with React components,
configure environment variables, and how the application interacts with the
garage API. Now let's push cross-platform support to the limit.

In our next exercise, we'll use React Native to ship a desktop, mobile, and web
application all from the same code base.
