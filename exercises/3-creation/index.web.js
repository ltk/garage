import { AppRegistry } from 'react-native'

import Layout from './common/views/layout'

AppRegistry.registerComponent('Garage', () => Layout)

AppRegistry.runApplication('Garage', {
  rootTag: document.querySelector('#root')
})
