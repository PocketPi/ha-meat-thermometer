"use client"

import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { Switch } from "../../../components/ui/switch"
import { Radio } from "lucide-react"
import { MQTTSettings } from "../types"

interface MQTTSettingsProps {
  settings: MQTTSettings
  onSettingsChange: (settings: MQTTSettings) => void
}

export default function MQTTSettingsComponent({ settings, onSettingsChange }: MQTTSettingsProps) {
  return (
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
            checked={settings.enabled}
            onCheckedChange={(checked) => onSettingsChange({ ...settings, enabled: checked })}
          />
        </div>

        {settings.enabled && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mqtt-broker">MQTT Broker</Label>
                <Input
                  id="mqtt-broker"
                  value={settings.broker}
                  onChange={(e) => onSettingsChange({ ...settings, broker: e.target.value })}
                  placeholder="192.168.1.100"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mqtt-port">Port</Label>
                <Input
                  id="mqtt-port"
                  type="number"
                  value={settings.port}
                  onChange={(e) => {
                    const value = e.target.value === "" ? 1883 : Number(e.target.value)
                    onSettingsChange({ ...settings, port: isNaN(value) ? 1883 : value })
                  }}
                  placeholder="1883"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mqtt-username">Username</Label>
                <Input
                  id="mqtt-username"
                  value={settings.username}
                  onChange={(e) => onSettingsChange({ ...settings, username: e.target.value })}
                  placeholder="Optional"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mqtt-password">Password</Label>
                <Input
                  id="mqtt-password"
                  type="password"
                  value={settings.password}
                  onChange={(e) => onSettingsChange({ ...settings, password: e.target.value })}
                  placeholder="Optional"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mqtt-client-id">Client ID</Label>
                <Input
                  id="mqtt-client-id"
                  value={settings.clientId}
                  onChange={(e) => onSettingsChange({ ...settings, clientId: e.target.value })}
                  placeholder="thermometer"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mqtt-base-topic">Base Topic</Label>
                <Input
                  id="mqtt-base-topic"
                  value={settings.baseTopic}
                  onChange={(e) => onSettingsChange({ ...settings, baseTopic: e.target.value })}
                  placeholder="homeassistant/sensor/thermometer"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mqtt-discovery">Discovery Prefix</Label>
                <Input
                  id="mqtt-discovery"
                  value={settings.discoveryPrefix}
                  onChange={(e) => onSettingsChange({ ...settings, discoveryPrefix: e.target.value })}
                  placeholder="homeassistant"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mqtt-qos">QoS Level</Label>
                <Input
                  id="mqtt-qos"
                  type="number"
                  min="0"
                  max="2"
                  value={settings.qos}
                  onChange={(e) => {
                    const value = e.target.value === "" ? 0 : Number(e.target.value)
                    onSettingsChange({ ...settings, qos: isNaN(value) ? 0 : Math.max(0, Math.min(2, value)) })
                  }}
                  placeholder="0"
                />
                <p className="text-xs text-muted-foreground">0: At most once, 1: At least once, 2: Exactly once</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="mqtt-retain">Retain Messages</Label>
                <p className="text-xs text-muted-foreground">Keep last message on broker</p>
              </div>
              <Switch
                id="mqtt-retain"
                checked={settings.retainMessages}
                onCheckedChange={(checked) => onSettingsChange({ ...settings, retainMessages: checked })}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
