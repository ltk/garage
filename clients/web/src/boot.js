import React from 'react'
import DOM from 'react-dom'
import Layout from './views/layout'

const el = document.getElementById('app')

function render () {
  DOM.render(<Layout />, el)
}

render()

if (module.hot) {
  module.hot.accept('./views/layout', render)
}
