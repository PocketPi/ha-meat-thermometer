"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { Switch } from "../../../components/ui/switch"
import { ChevronDown, ChevronUp, Wifi, RefreshCw, WifiOff } from "lucide-react"
import { useWifiScan } from "../../api/wifi-scan"
import { WiFiSettings, WiFiNetwork } from "../types"

interface WiFiSettingsProps {
  settings: WiFiSettings
  onSettingsChange: (settings: WiFiSettings) => void
}

export default function WiFiSettingsComponent({ settings, onSettingsChange }: WiFiSettingsProps) {
  const [showAdvancedWifi, setShowAdvancedWifi] = useState(false)
  const [isLocalScanning, setIsLocalScanning] = useState(false)
  const { networks: wifiNetworks, isLoading: isScanning, error: scanError, mutate: refreshWifiScan } = useWifiScan()

  const scanWiFiNetworks = async () => {
    setIsLocalScanning(true)
    // Clear the list immediately, then refresh
    refreshWifiScan({ networks: [], count: 0 }, { revalidate: true })
    
    // Reset local scanning state after a delay
    setTimeout(() => {
      setIsLocalScanning(false)
    }, 2000)
  }

  const selectNetwork = (ssid: string) => {
    onSettingsChange({ ...settings, ssid, isConnected: true })
  }

  const connectToDifferentWiFi = () => {
    onSettingsChange({ ...settings, ssid: "", isConnected: false })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
          <Wifi className="h-5 w-5" />
          WiFi Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Connection Status */}
        {!settings.isConnected ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 border border-dashed rounded-lg">
              <WifiOff className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium">Not connected to WiFi</p>
                <p className="text-xs text-muted-foreground">Select a network below to connect</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-800">WiFi Name (SSID)</p>
                  <p className="text-xs text-green-600">{settings.ssid}</p>
                </div>
              </div>
        <div className="space-y-2">
          <Button
            onClick={connectToDifferentWiFi}
            variant="outline"
            size="sm"
            className="w-full"
          >
            Change Network
          </Button>
        </div>
            </div>
          </div>
        )}

        {/* Network Selection - Always show when not connected */}
        {!settings.isConnected && (
          <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Select WiFi Network</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={scanWiFiNetworks}
                disabled={isScanning || isLocalScanning}
                className="gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${(isScanning || isLocalScanning) ? 'animate-spin' : ''}`} />
                {(isScanning || isLocalScanning) ? 'Scanning...' : 'Refresh'}
              </Button>
            </div>
            
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {wifiNetworks.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {(isScanning || isLocalScanning) ? 'Scanning for networks...' : 'No networks found'}
                </p>
              ) : (
                wifiNetworks.map((network: WiFiNetwork) => (
                  <div
                    key={network.ssid}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                    onClick={() => selectNetwork(network.ssid)}
                  >
                    <div className="flex items-center gap-3">
                      <Wifi className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{network.ssid || '(Hidden Network)'}</p>
                        <p className="text-xs text-muted-foreground">{network.rssi} dBm</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      Connect
                    </Button>
                  </div>
                ))
              )}
            </div>
            
            {scanError && (
              <p className="text-sm text-destructive">
                {scanError.message || 'Failed to scan networks'}
              </p>
            )}
          </div>
        )}

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
                  checked={settings.staticIP}
                  onCheckedChange={(checked) => onSettingsChange({ ...settings, staticIP: checked })}
                />
              </div>

              {settings.staticIP && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ip-address">IP Address</Label>
                    <Input
                      id="ip-address"
                      value={settings.ipAddress}
                      onChange={(e) => onSettingsChange({ ...settings, ipAddress: e.target.value })}
                      placeholder="192.168.1.100"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gateway">Gateway</Label>
                    <Input
                      id="gateway"
                      value={settings.gateway}
                      onChange={(e) => onSettingsChange({ ...settings, gateway: e.target.value })}
                      placeholder="192.168.1.1"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subnet">Subnet Mask</Label>
                    <Input
                      id="subnet"
                      value={settings.subnet}
                      onChange={(e) => onSettingsChange({ ...settings, subnet: e.target.value })}
                      placeholder="255.255.255.0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dns1">Primary DNS</Label>
                    <Input
                      id="dns1"
                      value={settings.dns1}
                      onChange={(e) => onSettingsChange({ ...settings, dns1: e.target.value })}
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
  )
}
