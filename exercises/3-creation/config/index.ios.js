import Config from 'react-native-config'

export const API_URL = Config.API_URL
export const POLL_INTERVAL = parseInt(Config.POLL_INTERVAL || 1000, 10)
