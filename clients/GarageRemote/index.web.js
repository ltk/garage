import { AppRegistry } from 'react-native'

import Layout from './src/views/layout'

AppRegistry.registerComponent('GarageRemote', () => Layout)

AppRegistry.runApplication('GarageRemote', {
  rootTag: document.querySelector('#root')
})
