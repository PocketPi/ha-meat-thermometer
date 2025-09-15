export interface ThermometerSettings {
  id: string
  name: string
  targetTemp: number
  alertEnabled: boolean
  alertThreshold: number
}

export interface WiFiNetwork {
  ssid: string
  rssi: number
  authmode: number
}

export interface GlobalSettings {
  temperatureUnit: string
  updateInterval: number
  soundAlerts: boolean
  emailNotifications: boolean
  theme: string
}

export interface WiFiSettings {
  ssid: string
  isConnected: boolean
  staticIP: boolean
  ipAddress: string
  gateway: string
  subnet: string
  dns1: string
  dns2: string
}

export interface MQTTSettings {
  enabled: boolean
  broker: string
  port: number
  username: string
  password: string
  clientId: string
  baseTopic: string
  discoveryPrefix: string
  retainMessages: boolean
  qos: number
}
