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
