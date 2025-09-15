"use client"

import { useState, useEffect } from "react"
import GlobalSettingsComponent from "./components/GlobalSettings"
import WiFiSettingsComponent from "./components/WiFiSettings"
import MQTTSettingsComponent from "./components/MQTTSettings"
import ThermometerSettingsComponent from "./components/ThermometerSettings"
import { ThermometerSettings, GlobalSettings, WiFiSettings, MQTTSettings } from "./types"
import { useTheme } from "../../components/theme-provider"
import { useTemperatureData } from "../api/temperature"

export default function Settings() {
  const { theme } = useTheme()
  const { data: tempData } = useTemperatureData()
  
  const [thermometers, setThermometers] = useState<ThermometerSettings[]>([
    {
      id: "1",
      name: "Grill Station 1",
      targetTemp: tempData?.temp_0_target || 71,
      alertEnabled: true,
    },
    {
      id: "2",
      name: "Smoker Unit",
      targetTemp: tempData?.temp_1_target || 93,
      alertEnabled: true,
    },
    {
      id: "3",
      name: "Oven Probe",
      targetTemp: tempData?.temp_2_target || 74,
      alertEnabled: false,
    },
  ])

  // Update thermometer target temperatures when API data changes
  useEffect(() => {
    if (tempData) {
      setThermometers(prev => prev.map((thermo, index) => ({
        ...thermo,
        targetTemp: [
          tempData.temp_0_target,
          tempData.temp_1_target,
          tempData.temp_2_target,
          tempData.temp_3_target
        ][index] || thermo.targetTemp
      })))
    }
  }, [tempData])

  const [globalSettings, setGlobalSettings] = useState<GlobalSettings>({
    soundAlerts: true,
    emailNotifications: false,
    theme: theme,
  })

  // Sync theme with global settings
  useEffect(() => {
    setGlobalSettings(prev => ({ ...prev, theme }))
  }, [theme])

  const [wifiSettings, setWifiSettings] = useState<WiFiSettings>({
    ssid: "",
    isConnected: false,
    staticIP: false,
    ipAddress: "",
    gateway: "",
    subnet: "",
    dns1: "",
    dns2: "",
  })

  const [mqttSettings, setMqttSettings] = useState<MQTTSettings>({
    enabled: false,
    broker: "",
    port: 1883,
    username: "",
    password: "",
    clientId: "thermometer",
    baseTopic: "homeassistant/sensor/thermometer",
    discoveryPrefix: "homeassistant",
    retainMessages: true,
    qos: 0,
  })

  return (
    <div className="grid grid-cols-1 gap-6 w-full overflow-x-hidden">
      {/* Global Settings */}
      <GlobalSettingsComponent
        settings={globalSettings}
        onSettingsChange={setGlobalSettings}
      />

      {/* WiFi Settings */}
      <WiFiSettingsComponent
        settings={wifiSettings}
        onSettingsChange={setWifiSettings}
      />

      {/* MQTT Settings */}
      <MQTTSettingsComponent
        settings={mqttSettings}
        onSettingsChange={setMqttSettings}
      />

      {/* Thermometer Settings */}
      <ThermometerSettingsComponent
        thermometers={thermometers}
        onThermometersChange={setThermometers}
      />

    </div>
  )
}
