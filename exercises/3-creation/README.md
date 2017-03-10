# Final Exercise: Creation

You made it. Over the past two projects, we've looked at writing
applications across desktop and web. Let's take it a step further by
shipping to mobile.

To do this, we'll
use [ReactNative](https://facebook.github.io/react-native/). You'll
need to run a few steps before you begin:

## Setting up React Native

Follow the
[getting started guide](https://facebook.github.io/react-native/docs/getting-started.html#content) over
at the React Native website to setup all of the dependencies for this
project. There are a few.

For those on Windows, iOS will be a challenge (nigh impossible). Feel
free to continue on with Android.

## Up and running

Once you've finished setting things up, boot the Garage API:

```bash
cd <path-to>/garage
foreman start
```

Then switch to this exercise and run a familiar set of commands:

```bash
cd exercises/3-creation
yarn install
yarn start:ios
```

You'll probably notice some guides have you run `react-native
run-ios`. This is totally fine, we just like to keep scripts central
to package.json. It means we have a single place to look for anything
related to build tasks.

## Taking a look around

React Native generates a project structure that deviates a little bit
from what we've done before:

```bash
.
├── README.md
├── android
├── ios
├── index.android.js
├── index.ios.js
├── node_modules
├── package.json
└── yarn.lock
```

Android and iOS are native projects, which means they compile native
code. Each related folder contains everything we need to build each
project.

We've seen this before. Keeping platform differences at the edges of
our app lets us focus on what we're building. Less on platform
implementation details.

## Getting started

By now your emulator has probably fired up (please ping us if you
encounter issues). However you'll see the default React Native app
screen.

Before digging in, let's copy over some of the code we've already worked
with:

```bash
mkdir common
cp ../2-changing/common/actions.js common/
```

ReactNative provides an abstraction layer to support many common DOM
APIs. This includes `XMLHTTPRequest`, so we can use the exact same
AJAX library we had previously.

We've gone ahead and added `xhr`, our AJAX library, with the initial
project setup. No need to install it again.

## Environment variables

If you'll recall, up to this point, we relied on environment variables
to distribute project configuration settings. We need to set that same
process up here.

There are a number of packages that help us do this. We've included
[react-native-config](https://github.com/luggit/react-native-config)
for convenience's sake.

Now too to hook up the pieces. First, copy over the .env file from the
previous example:

```bash
cp ../2-changing/.env ./
```

Now we can access configuration settings by importing the
`react-native-config` module. Let's open up `common/actions.js` and
set this up:

```javascript
// common/actions.js
import Config from 'react-native-config'
// ...
const API_URL = Config.API_URL
```

That's it! Now let's make a working app...

## The view layer

React Native still uses React, but it no longer lives in the DOM
environment. We replace components like `<div>` and `<p>` with
`<View>` and `<Text />`.

To start, let's copy over the `layout.js` component from the previous
example:

```bash
mkdir -p common/views
cp ../2-changing/common/views/ common/views
```

Next let's update our index.ios.js and index.android.js files to pull
in that view component:

```javascript
// This is the same between both files. Solidarity!
import { AppRegistry } from 'react-native'

import Layout from './common/views/layout'

AppRegistry.registerComponent('Garage', () => Layout)
```

Of course, doing this will cause the your application to throw an
error. We're still rendering HTML in that component! Next we need to
replace all instances of HTML with special React Native components:

```javascript
import React from 'react'
import Config from 'react-native-config'

import {
  Button,
  Text,
  View
} from 'react-native'

import {
  getStatus,
  postCommand
} from '../actions'

const POLL_TIME = parseInt(Config.POLL_TIME || 1000)

export default class Layout extends React.Component {
  // ...
  // Nothing between the top of this file and the following lines
  // change. Hurrah!

  renderError () {
    return <Text>Error! {this.state.message}</Text>
  }

  render () {
    const { error, status, progress } = this.state

    let shouldClose = status === 'opening' || status === 'opening'

    return (
      <View>
        <Text>
          The Garage is {this.state.status}
        </Text>

        <View>
          <Text>Progress: {progress * 100}%</Text>
          { error ? this.renderError() : null }
        </View>

        <View>
          <Button title={shouldClose ? 'Close' : 'Open'}
                  onPress={shouldClose ? this.close : this.open} />
        </View>
      </View>
    )
  }
}
```

We're done here. Sort of. If you view the page, you'll notice that
everything is crammed at the top of the page! We have no style. Let's
fix that.

## Styling components with React Native

React Native uses a JavaScript to style. It has you build up
JavaScript objects of style properties and pass them in as props to
React components.

We'll breeze through this section, however there is a wealth of
material to read in
the [Styles](https://facebook.github.io/react-native/docs/style.html)
section of the React Native documentation.

Make a new file, `views/styles.js'. It should look something like
this:

```javascript
import { StyleSheet } from 'react-native'

export default StyleSheet.create({

  container: {
    alignItems: 'center',
    flexDirection: 'column',
    flexGrow: 1,
    flex: 1,
    justifyContent: 'center',
    paddingTop: 40
  },

  header: {
    fontSize: 24,
    fontWeight: 'bold'
  },

  main: {
    flex: 1,
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20
  },

  footer: {
    justifyContent: 'center',
    flexDirection: 'row',
    padding: 20
  }

})
```

Then, in `layout.js`, we can reference these style rules by placing
them within the `styles` property of the React Native components:

```javascript
// ...

import styles from './styles'

export default class Layout extends React.Component {
  // ...
  render () {
    const { error, status, progress } = this.state

    let shouldClose = status === 'opening' || status === 'opening'

    return (
      <View style={styles.container}>
        <Text style={styles.header}>
          The Garage is {this.state.status}
        </Text>

        <View style={styles.main}>
          <Text>Progress {this.state.progress}%</Text>
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
```

Looking sharp!

## What happened to my progress bar?

You might notice that we've conveniently omitted the progress bar we
had from the web version. There's a reason for this: **React Native
has specific progress bar elements for each platform**.

Fortunately for us, React Native allows us to create platform
specific exceptions to the rules by using a naming convention like
`file.ios.js`.

We can do that too. Let's start by creating a folder to contain our
different progress bars:

```bash
mkdir -p views/progress
```

Then let's make a new iOS progress bar:

```javascript
// views/progress/index.ios.js
import React from 'react'

import {
  ProgressViewIOS
} from 'react-native'

export default function ({ progress }) {
  return <ProgressViewIOS progress={progress} />
}
```

Simple right? Let's do the same for Android:

```javascript
// views/progress/index.android.js
import React from 'react'

import {
  ProgressBarAndroid
} from 'react-native'

export default function ({ progress }) {
  return <ProgressBarAndroid progress={progress} />
}
```

We're all set! Seriously that was it. It's simple for us, but in
larger apps, you might have whole trees of components tailored to a
specific platform. This approach allows you to provide the best user
experience for each platform (where it sufficiently differs).

Alright, last step. Let's place our new Progress bar component into
the app:

```javascript
// views/layout.js
// ...
import Progress from './progress'

export default class Layout extends React.Component {
  // ...

  render () {
    // ..
    return (
      <View style={styles.container}>
        {/*...*/}
        <View style={styles.main}>
          <Text>Progress</Text>

          <Progress progress={this.state.progress} />

          { error ? this.renderError() : null }
        </View>
        {/*...*/}
      </View>
    )
  }
}
```

And now we have platform specific progress bars!

## Wrapping up

We've walked through shipping across Android and iOS. We've
used a lot of code we've seen before, and worked through writing
platform specific code where warranted.

Thanks for sticking with us. For the adventurous, stay on for the
final section...

## What's next

We can go further. We can use React Native to ship to the web
using
[`react-native-web`](https://github.com/necolas/react-native-web). We've
even gone ahead and added it to this project.

We'll keep this part open ended. Here are a couple of questions to
keep in mind as you build out the web platform:

1. Building for web means compiling JavaScript with Webpack. What does
that configuration look like?
2. Webpack doesn't know how to use the `react-native-config` package
   for environment variables. How can you share environment variables between Android, iOS, and
   web? Would the approach we took for the progress bar work well here
   as well?
3. What is the best way to pull in a web specific progress bar? Hint:
   checkout the [native HTML progress bar element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/progress).

By this point, we're probably out of time. However we'll be around to
help answer questions as they come up.

Good luck!
