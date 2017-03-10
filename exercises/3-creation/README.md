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
free to continue on with Android. You'll still share code, and add an
additional platform later on.

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

```bash
// common/actions.js

```
