export interface ThermometerSettings {
  id: string
  name: string
  targetTemp: number
  alertEnabled: boolean
}

export interface WiFiNetwork {
  ssid: string
  rssi: number
  authmode: number
}

export interface WiFiStationInfo {
  ssid: string
}

export interface WiFiCredentials {
  ssid: string
  password: string
}

export interface TemperatureData {
  temp_0: number
  temp_1: number
  temp_2: number
  temp_3: number
  temp_0_target: number
  temp_1_target: number
  temp_2_target: number
  temp_3_target: number
}

export interface TemperatureTargets {
  temp_0: number
  temp_1: number
  temp_2: number
  temp_3: number
}

export interface GlobalSettings {
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
