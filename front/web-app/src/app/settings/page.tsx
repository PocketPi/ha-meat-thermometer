"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Plus, Trash2, Save, ChevronDown, ChevronUp, Wifi, Radio } from "lucide-react"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"

interface ThermometerSettings {
  id: string
  name: string
  targetTemp: number
  meatType: string
  alertEnabled: boolean
  alertThreshold: number
}

export default function Settings() {
  const [thermometers, setThermometers] = useState<ThermometerSettings[]>([
    {
      id: "1",
      name: "Grill Station 1",
      targetTemp: 160,
      meatType: "beef",
      alertEnabled: true,
      alertThreshold: 5,
    },
    {
      id: "2",
      name: "Smoker Unit",
      targetTemp: 200,
      meatType: "pork",
      alertEnabled: true,
      alertThreshold: 3,
    },
    {
      id: "3",
      name: "Oven Probe",
      targetTemp: 165,
      meatType: "chicken",
      alertEnabled: false,
      alertThreshold: 5,
    },
  ])

  const [globalSettings, setGlobalSettings] = useState({
    temperatureUnit: "fahrenheit",
    updateInterval: 3,
    soundAlerts: true,
    emailNotifications: false,
  })

  const [wifiSettings, setWifiSettings] = useState({
    ssid: "",
    password: "",
    staticIP: false,
    ipAddress: "",
    gateway: "",
    subnet: "",
    dns1: "",
    dns2: "",
  })

  const [mqttSettings, setMqttSettings] = useState({
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

  const [showAdvancedWifi, setShowAdvancedWifi] = useState(false)

  const addThermometer = () => {
    const newId = (thermometers.length + 1).toString()
    setThermometers([
      ...thermometers,
      {
        id: newId,
        name: `Thermometer ${newId}`,
        targetTemp: 160,
        meatType: "beef",
        alertEnabled: true,
        alertThreshold: 5,
      },
    ])
  }

  const removeThermometer = (id: string) => {
    setThermometers(thermometers.filter((t) => t.id !== id))
  }

  const updateThermometer = (id: string, updates: Partial<ThermometerSettings>) => {
    setThermometers(thermometers.map((t) => (t.id === id ? { ...t, ...updates } : t)))
  }

  const meatTypes = [
    { value: "beef", label: "Beef", temp: 160 },
    { value: "pork", label: "Pork", temp: 200 },
    { value: "chicken", label: "Chicken", temp: 165 },
    { value: "fish", label: "Fish", temp: 145 },
    { value: "lamb", label: "Lamb", temp: 160 },
    { value: "custom", label: "Custom", temp: 160 },
  ]

  return (
    <div className="min-h-screen bg-background p-3 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div className="flex items-center gap-3 sm:gap-4">
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Settings</h1>
              <p className="text-sm sm:text-base text-muted-foreground">Configure your thermometer preferences</p>
            </div>
          </div>
          <ThemeToggle />
        </div>

        <div className="space-y-4 sm:space-y-6">
          {/* Global Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Global Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="temp-unit">Temperature Unit</Label>
                  <Select
                    value={globalSettings.temperatureUnit}
                    onValueChange={(value) => setGlobalSettings({ ...globalSettings, temperatureUnit: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fahrenheit">Fahrenheit (°F)</SelectItem>
                      <SelectItem value="celsius">Celsius (°C)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="update-interval">Update Interval (seconds)</Label>
                  <Input
                    id="update-interval"
                    type="number"
                    value={globalSettings.updateInterval}
                    onChange={(e) => {
                      const value = e.target.value === "" ? 1 : Number(e.target.value)
                      setGlobalSettings({ ...globalSettings, updateInterval: isNaN(value) ? 1 : value })
                    }}
                    min="1"
                    max="60"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
                  <div>
                    <Label htmlFor="sound-alerts">Sound Alerts</Label>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Play sound when temperature targets are reached
                    </p>
                  </div>
                  <Switch
                    id="sound-alerts"
                    checked={globalSettings.soundAlerts}
                    onCheckedChange={(checked) => setGlobalSettings({ ...globalSettings, soundAlerts: checked })}
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
                  <div>
                    <Label htmlFor="email-notifications">Email Notifications</Label>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Receive email alerts for temperature changes
                    </p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={globalSettings.emailNotifications}
                    onCheckedChange={(checked) => setGlobalSettings({ ...globalSettings, emailNotifications: checked })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* WiFi Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                <Wifi className="h-5 w-5" />
                WiFi Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="wifi-ssid">Network Name (SSID)</Label>
                  <Input
                    id="wifi-ssid"
                    value={wifiSettings.ssid}
                    onChange={(e) => setWifiSettings({ ...wifiSettings, ssid: e.target.value })}
                    placeholder="Enter WiFi network name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="wifi-password">Password</Label>
                  <Input
                    id="wifi-password"
                    type="password"
                    value={wifiSettings.password}
                    onChange={(e) => setWifiSettings({ ...wifiSettings, password: e.target.value })}
                    placeholder="Enter WiFi password"
                  />
                </div>
              </div>

              {/* Advanced WiFi Settings */}
              <div className="border-t pt-4">
                <Button
                  variant="ghost"
                  onClick={() => setShowAdvancedWifi(!showAdvancedWifi)}
                  className="flex items-center gap-2 p-0 h-auto text-sm"
                >
                  {showAdvancedWifi ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  Advanced Settings
                </Button>

                {showAdvancedWifi && (
                  <div className="mt-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="static-ip">Use Static IP</Label>
                        <p className="text-xs text-muted-foreground">Configure manual IP address</p>
                      </div>
                      <Switch
                        id="static-ip"
                        checked={wifiSettings.staticIP}
                        onCheckedChange={(checked) => setWifiSettings({ ...wifiSettings, staticIP: checked })}
                      />
                    </div>

                    {wifiSettings.staticIP && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="ip-address">IP Address</Label>
                          <Input
                            id="ip-address"
                            value={wifiSettings.ipAddress}
                            onChange={(e) => setWifiSettings({ ...wifiSettings, ipAddress: e.target.value })}
                            placeholder="192.168.1.100"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="gateway">Gateway</Label>
                          <Input
                            id="gateway"
                            value={wifiSettings.gateway}
                            onChange={(e) => setWifiSettings({ ...wifiSettings, gateway: e.target.value })}
                            placeholder="192.168.1.1"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="subnet">Subnet Mask</Label>
                          <Input
                            id="subnet"
                            value={wifiSettings.subnet}
                            onChange={(e) => setWifiSettings({ ...wifiSettings, subnet: e.target.value })}
                            placeholder="255.255.255.0"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="dns1">Primary DNS</Label>
                          <Input
                            id="dns1"
                            value={wifiSettings.dns1}
                            onChange={(e) => setWifiSettings({ ...wifiSettings, dns1: e.target.value })}
                            placeholder="8.8.8.8"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* MQTT Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                <Radio className="h-5 w-5" />
                MQTT Settings
              </CardTitle>
              <p className="text-sm text-muted-foreground">Configure Home Assistant integration</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="mqtt-enabled">Enable MQTT</Label>
                  <p className="text-xs text-muted-foreground">Connect to Home Assistant via MQTT</p>
                </div>
                <Switch
                  id="mqtt-enabled"
                  checked={mqttSettings.enabled}
                  onCheckedChange={(checked) => setMqttSettings({ ...mqttSettings, enabled: checked })}
                />
              </div>

              {mqttSettings.enabled && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="mqtt-broker">MQTT Broker</Label>
                      <Input
                        id="mqtt-broker"
                        value={mqttSettings.broker}
                        onChange={(e) => setMqttSettings({ ...mqttSettings, broker: e.target.value })}
                        placeholder="192.168.1.100"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="mqtt-port">Port</Label>
                      <Input
                        id="mqtt-port"
                        type="number"
                        value={mqttSettings.port}
                        onChange={(e) => {
                          const value = e.target.value === "" ? 1883 : Number(e.target.value)
                          setMqttSettings({ ...mqttSettings, port: isNaN(value) ? 1883 : value })
                        }}
                        placeholder="1883"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="mqtt-username">Username</Label>
                      <Input
                        id="mqtt-username"
                        value={mqttSettings.username}
                        onChange={(e) => setMqttSettings({ ...mqttSettings, username: e.target.value })}
                        placeholder="Optional"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="mqtt-password">Password</Label>
                      <Input
                        id="mqtt-password"
                        type="password"
                        value={mqttSettings.password}
                        onChange={(e) => setMqttSettings({ ...mqttSettings, password: e.target.value })}
                        placeholder="Optional"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="mqtt-client-id">Client ID</Label>
                      <Input
                        id="mqtt-client-id"
                        value={mqttSettings.clientId}
                        onChange={(e) => setMqttSettings({ ...mqttSettings, clientId: e.target.value })}
                        placeholder="thermometer"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="mqtt-base-topic">Base Topic</Label>
                      <Input
                        id="mqtt-base-topic"
                        value={mqttSettings.baseTopic}
                        onChange={(e) => setMqttSettings({ ...mqttSettings, baseTopic: e.target.value })}
                        placeholder="homeassistant/sensor/thermometer"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="mqtt-discovery">Discovery Prefix</Label>
                      <Input
                        id="mqtt-discovery"
                        value={mqttSettings.discoveryPrefix}
                        onChange={(e) => setMqttSettings({ ...mqttSettings, discoveryPrefix: e.target.value })}
                        placeholder="homeassistant"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="mqtt-qos">QoS Level</Label>
                      <Select
                        value={mqttSettings.qos.toString()}
                        onValueChange={(value) => setMqttSettings({ ...mqttSettings, qos: Number.parseInt(value) })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">0 - At most once</SelectItem>
                          <SelectItem value="1">1 - At least once</SelectItem>
                          <SelectItem value="2">2 - Exactly once</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="mqtt-retain">Retain Messages</Label>
                      <p className="text-xs text-muted-foreground">Keep last message on broker</p>
                    </div>
                    <Switch
                      id="mqtt-retain"
                      checked={mqttSettings.retainMessages}
                      onCheckedChange={(checked) => setMqttSettings({ ...mqttSettings, retainMessages: checked })}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Thermometer Settings */}
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <CardTitle className="text-lg sm:text-xl">Thermometer Configuration</CardTitle>
              <Button onClick={addThermometer} size="sm" className="gap-2 self-start sm:self-auto">
                <Plus className="h-4 w-4" />
                <span className="text-sm">Add Thermometer</span>
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {thermometers.map((thermo) => (
                <Card key={thermo.id} className="p-3 sm:p-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-sm sm:text-base">Thermometer {thermo.id}</h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeThermometer(thermo.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm">Name</Label>
                        <Input
                          value={thermo.name}
                          onChange={(e) => updateThermometer(thermo.id, { name: e.target.value })}
                          placeholder="Thermometer name"
                          className="text-sm"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm">Meat Type</Label>
                        <Select
                          value={thermo.meatType}
                          onValueChange={(value) => {
                            const meatType = meatTypes.find((m) => m.value === value)
                            updateThermometer(thermo.id, {
                              meatType: value,
                              targetTemp: meatType?.temp || thermo.targetTemp,
                            })
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {meatTypes.map((meat) => (
                              <SelectItem key={meat.value} value={meat.value}>
                                {meat.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm">Target Temperature (°F)</Label>
                        <Input
                          type="number"
                          value={thermo.targetTemp}
                          onChange={(e) => {
                            const value = e.target.value === "" ? 160 : Number(e.target.value)
                            updateThermometer(thermo.id, { targetTemp: isNaN(value) ? 160 : value })
                          }}
                          min="32"
                          max="500"
                          className="text-sm"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={thermo.alertEnabled}
                            onCheckedChange={(checked) => updateThermometer(thermo.id, { alertEnabled: checked })}
                          />
                          <Label className="text-sm">Enable Alerts</Label>
                        </div>
                        {thermo.alertEnabled && (
                          <div className="flex items-center space-x-2">
                            <Label className="text-sm">Threshold:</Label>
                            <Input
                              type="number"
                              value={thermo.alertThreshold}
                              onChange={(e) => {
                                const value = e.target.value === "" ? 5 : Number(e.target.value)
                                updateThermometer(thermo.id, { alertThreshold: isNaN(value) ? 5 : value })
                              }}
                              className="w-16 sm:w-20 text-sm"
                              min="1"
                              max="20"
                            />
                            <span className="text-sm text-muted-foreground">°F</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button size="lg" className="gap-2 w-full sm:w-auto">
              <Save className="h-4 w-4" />
              Save Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
