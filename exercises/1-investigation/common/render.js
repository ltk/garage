import React from 'react'
import DOM from 'react-dom'
import Layout from './views/layout'

export default function render (selector) {
  let el = document.querySelector(selector)

  return DOM.render(<Layout />, el)
}
