"use client"

import { useState, useEffect } from "react"
import { Button } from "../../components/ui/button"
import { Save } from "lucide-react"
import GlobalSettingsComponent from "./components/GlobalSettings"
import WiFiSettingsComponent from "./components/WiFiSettings"
import MQTTSettingsComponent from "./components/MQTTSettings"
import ThermometerSettingsComponent from "./components/ThermometerSettings"
import { ThermometerSettings, GlobalSettings, WiFiSettings, MQTTSettings } from "./types"
import { useTheme } from "../../components/theme-provider"

export default function Settings() {
  const { theme } = useTheme()
  
  const [thermometers, setThermometers] = useState<ThermometerSettings[]>([
    {
      id: "1",
      name: "Grill Station 1",
      targetTemp: 160,
      alertEnabled: true,
      alertThreshold: 5,
    },
    {
      id: "2",
      name: "Smoker Unit",
      targetTemp: 200,
      alertEnabled: true,
      alertThreshold: 3,
    },
    {
      id: "3",
      name: "Oven Probe",
      targetTemp: 165,
      alertEnabled: false,
      alertThreshold: 5,
    },
  ])

  const [globalSettings, setGlobalSettings] = useState<GlobalSettings>({
    temperatureUnit: "celsius",
    updateInterval: 1,
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full overflow-x-hidden">
      {/* Left Column */}
      <div className="space-y-6">
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
      </div>

      {/* Right Column */}
      <div className="space-y-6">
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

      {/* Full Width Save Button */}
      <div className="lg:col-span-2 flex justify-end">
        <Button size="lg" className="gap-2 w-full sm:w-auto">
          <Save className="h-4 w-4" />
          Save Settings
        </Button>
      </div>
    </div>
  )
}
