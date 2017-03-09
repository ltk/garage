# First Exercise: Investigation

Shipping an application across multiple clients isn't easy. Let's
start by walking through an existing cross platform application.

We'll cover the following topics:

1. Setup
2. Centralizing start-up scripts
3. Configuration
4. Handling platform differences

## Setup

To get started with this project, we need to run a few steps:

```bash
# Install yarn, our JavaScript package manager
brew install yarn

# Install JavaScript dependencies
yarn install
```

### Why Yarn instead of npm?

Some of you may be familiar with `npm`. We like `yarn` because it
supports lock files, which guarantee the same dependencies are
installed between machines. It's also faster, and has some features
that make it more secure.

When installation finishes, boot up the web client:

```bash
yarn start:web
```

This will host a simple Garage Door app at `http://localhost:4000`.

Let's boot the desktop app while we're thinking about it:

```bash
yarn start:electron
```

This will open a window with the exact same screen, it just doesn't
live in a browser.

### What yarn start:x is doing

Let's crack open `package.json` and checkout the `"scripts"` entry:

```javascript
{
  "name": "garage-client",
  "scripts": {
    "start:web": "webpack-dev-server --config ./platforms/web/webpack.config.js",
    "start:electron": "electron ./platforms/desktop"
  },
  //...
}
```

We like to keep scripts for common tasks inside of `package.json`. By
sticking to similar naming conventions, we can create patterns across
projects that are easy to expect.

When invoking `yarn start:web`, yarn sees that `start:web` isn't a
registered CLI command, so it checks the `"scripts"` entry in
`package.json`.

One key advantage to this approach is that `bin` programs bundled with
npm dependencies are automatically added to the `PATH` environment
variable, so using a consistent version of a CLI tool becomes simple.

## Browsing around

Now that we have the app running, let's take a quick look around the project:

```bash
common/
platforms/
├── desktop
└── web
```

Since the electron and web environments are similar enough, all shared
code lives in the `common` folder. Then we have a separate folder
within `platforms` for each target.

## Sharing configuration with .dotfiles

In true [12 factor form](https://12factor.net/config), we like to keep
all shared configuration central, where it's easy to find. This is
flexible because it allows us to modify configuration in layers:

1. By environment. Global constants such as where to find an API can
   be configured differently between test, development, and
   production environments.
2. By platform. One platform may have additional configuration
   requirements, or need to change values.

For example, let's take a look at the `.babelrc` file, which contains
our configuration for the Babel JavaScript compiler:

```
{
  "presets": [
    ["es2015", { "loose": true, "modules" : false }],
    "stage-0",
    "react"
  ]
}
```

We've disabled modules at the top level, which allows tools that
understand ES6, like Webpack, to take advantage of advanced features
like
[module tree shaking](https://blog.engineyard.com/2016/tree-shaking).

However we aren't using Webpack for the Electron app. Electron
understand the CommonJS module syntax out of the box. We can an
exception when we boot
up [`babel-register`](https://babeljs.io/docs/usage/babel-register/),
which tells Electron to compile `require()`'d modules with Babel:

```html
// index.html
<script>
  // Support ES6
  require('babel-register')({
    plugins: [
      "transform-es2015-modules-commonjs"
    ]
  });
  // ..
</script>
```

## Keep differences at the edge

Environment differences should not introduce complexity into the majority of
code. Electron apps are going to start up differently than web apps,
that complexity should be pushed away from the core application code
as much as possible.

A good example of this is the way we host assets for each
platform. Let's take a look at the web version:

```bash
platforms/web/
├── boot.js
├── public
│   └── index.html
└── webpack.config.js
```

We have a public folder, where user-facing assets are stored, with a
`boot.js` entry that pulls in the core rendering module inside of
`common`:

```javascript
import render from '../../common/render'

render('#app')
```

This is a bit different than our Electron app:

```bash
platforms/desktop/
├── boot.js
├── index.html
└── index.js
```

If you crack open `boot.js`, you'll notice that it is
identical. However our index.html file is different: it needs to do
some more setup work that `web` is getting for free with Webpack:

```html
<!-- platforms/desktop/index.html -->
<script>
  // Support ES6
  require('babel-register')({
    plugins: [
      "transform-es2015-modules-commonjs"
    ]
  });

  // Pull in environment variables
  require('dotenv').config({
    path: __dirname + '/../../.env'
  })

  // Start up the application
  require('./boot');
</script>
```

By keeping this setup behavior as close to Electron as possible, we
can share code between platforms much more easily.

## What's next

This concludes our round-about tour. In the next lesson, we'll dig
into modifying our common code, making cross-platform changes. will be
a breeze.
