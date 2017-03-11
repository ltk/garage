import React from 'react'

import {
  ActivityIndicator,
  View,
  Text
} from 'react-native'

const style = {
  container: {
    marginTop: 20,
    marginBottom: 20
  },

  label: {
    marginTop: 15,
    textAlign: 'center'
  }
}

export default function ({ progress }) {
  let animating = progress > 0 && progress < 1

  return (
    <View style={style.container}>
      <ActivityIndicator size="large" animating={animating} />

      <Text style={style.label}>
        {Math.round(progress * 100)}%
      </Text>
    </View>
  )
}
