"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { Switch } from "../../../components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../../components/ui/dialog"
import { ChevronDown, ChevronUp, Wifi, WifiOff, Eye, EyeOff } from "lucide-react"
import { useWifiScan } from "../../api/wifi-scan"
import { useWiFiStationInfo, useSetWiFiCredentials } from "../../api/wifi-station"
import { WiFiSettings, WiFiNetwork } from "../types"

interface WiFiSettingsProps {
  settings: WiFiSettings
  onSettingsChange: (settings: WiFiSettings) => void
}

export default function WiFiSettingsComponent({ settings, onSettingsChange }: WiFiSettingsProps) {
  const [showAdvancedWifi, setShowAdvancedWifi] = useState(false)
  const [isLocalScanning, setIsLocalScanning] = useState(false)
  const [password, setPassword] = useState("")
  const [isConnecting, setIsConnecting] = useState(false)
  const [isChangingNetwork, setIsChangingNetwork] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedNetwork, setSelectedNetwork] = useState<WiFiNetwork | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const { networks: wifiNetworks, isLoading: isScanning, error: scanError, mutate: refreshWifiScan, data: wifiData } = useWifiScan()
  const { data: stationInfo, isLoading: isStationLoading } = useWiFiStationInfo()
  const { setCredentials } = useSetWiFiCredentials()

  const scanWiFiNetworks = async () => {
    setIsLocalScanning(true)
    
    // Clear the list immediately
    refreshWifiScan({ networks: [], count: 0 }, { revalidate: true })
    
    // Reset state after a delay
    setTimeout(() => {
      setIsLocalScanning(false)
    }, 2000)
  }

  const selectNetwork = (network: WiFiNetwork) => {
    setSelectedNetwork(network)
    setIsModalOpen(true)
  }

  const restartDevice = async () => {
    try {
      console.log('Sending restart request to /api/v1/device/restart')
      const response = await fetch('/api/v1/device/restart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      console.log('Restart response status:', response.status)
      console.log('Restart response headers:', Object.fromEntries(response.headers.entries()))
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Restart response error:', errorText)
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
      }
      
      const responseData = await response.json()
      console.log('Restart response data:', responseData)
      console.log('Device restart initiated successfully')
    } catch (error) {
      console.error('Failed to restart device:', error)
      // Don't throw here as the credentials were already set successfully
    }
  }

  const handleConnect = async () => {
    if (!selectedNetwork || !password) return
    
    console.log('Starting WiFi connection process...', { ssid: selectedNetwork.ssid })
    setIsConnecting(true)
    
    try {
      console.log('Sending WiFi credentials...')
      const result = await setCredentials({ ssid: selectedNetwork.ssid, password })
      console.log('WiFi credentials sent successfully:', result)
      
      // Close modal and reset state immediately after successful credential setting
      console.log('Closing modal and resetting state...')
      setIsModalOpen(false)
      setPassword("")
      setSelectedNetwork(null)
      setShowPassword(false)
      setIsChangingNetwork(false)
      
      // Update settings to reflect the connection
      onSettingsChange({ ...settings, ssid: selectedNetwork.ssid, isConnected: true })
      
      // Call restart immediately, then redirect
      console.log('Initiating device restart...')
      try {
        await restartDevice()
        console.log('Device restart completed')
      } catch (error) {
        console.error('Restart failed:', error)
      }
      
      // Redirect to main page after restart call
      console.log('Redirecting to main page...')
      setTimeout(() => {
        window.location.href = '/'
      }, 1000)
      
    } catch (error) {
      console.error('Failed to connect to WiFi:', error)
      // Handle error - could show a toast or error message
    } finally {
      setIsConnecting(false)
    }
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setPassword("")
    setSelectedNetwork(null)
    setShowPassword(false)
  }

  // Test function to verify restart API works
  const testRestart = async () => {
    console.log('Testing restart API...')
    try {
      await restartDevice()
      console.log('Restart test completed')
    } catch (error) {
      console.error('Restart test failed:', error)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && password && !isConnecting) {
      handleConnect()
    }
  }


  const connectToDifferentWiFi = () => {
    setIsChangingNetwork(true)
    onSettingsChange({ ...settings, ssid: "", isConnected: false })
    setPassword("")
    // Start a WiFi scan when changing networks
    scanWiFiNetworks()
  }

  const cancelChangeNetwork = () => {
    setIsChangingNetwork(false)
    // Reset to the current connected state
    if (connectedSSID) {
      onSettingsChange({ ...settings, ssid: connectedSSID, isConnected: true })
    }
  }

  // Check if we're connected to WiFi based on station info
  const isConnected = stationInfo?.ssid && stationInfo.ssid.trim() !== ""
  const connectedSSID = stationInfo?.ssid || ""

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
          <Wifi className="h-5 w-5" />
          {isChangingNetwork ? "Change WiFi Network" : "WiFi Settings"}
          <Button
            onClick={testRestart}
            variant="outline"
            size="sm"
            className="ml-auto"
          >
            Test Restart
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Connection Status */}
        {isStationLoading ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 border border-dashed rounded-lg">
              <div className="h-5 w-5 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Checking WiFi connection...</p>
                <p className="text-xs text-muted-foreground">Please wait</p>
              </div>
            </div>
          </div>
        ) : !isConnected ? (
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
                <Wifi className="h-5 w-5 text-green-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-800">Connected to WiFi</p>
                  <p className="text-xs text-green-600">{connectedSSID}</p>
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

        {/* Network Selection - Show when not connected or when changing networks */}
        {(!isConnected || isChangingNetwork) && (
          <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">
                {isChangingNetwork ? "Select New WiFi Network" : "Select WiFi Network"}
              </Label>
              <div className="flex gap-2">
                {isChangingNetwork && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={cancelChangeNetwork}
                    className="gap-2"
                  >
                    Cancel
                  </Button>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={scanWiFiNetworks}
                  disabled={isScanning || isLocalScanning}
                  className="gap-2"
                >
                  <div className={`h-4 w-4 ${(isScanning || isLocalScanning) ? 'animate-spin' : ''}`}>
                    {(isScanning || isLocalScanning) ? (
                      <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                    ) : (
                      <div className="h-4 w-4 border border-current rounded"></div>
                    )}
                  </div>
                  {(isScanning || isLocalScanning) ? 'Scanning...' : 'Refresh'}
                </Button>
              </div>
            </div>
            
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {(wifiNetworks.length === 0) ? (
                <div className="text-center py-4">
                  {(isScanning || isLocalScanning) ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-6 w-6 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-sm text-muted-foreground">Scanning for networks...</p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {wifiData === undefined ? 'Click "Refresh" to scan for WiFi networks' : 'No networks found'}
                    </p>
                  )}
                </div>
              ) : (
                wifiNetworks.map((network: WiFiNetwork) => (
                  <div
                    key={network.ssid}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <Wifi className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{network.ssid || '(Hidden Network)'}</p>
                        <p className="text-xs text-muted-foreground">{network.rssi} dBm</p>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => selectNetwork(network)}
                    >
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

      {/* WiFi Connection Modal */}
      <Dialog open={isModalOpen} onOpenChange={handleModalClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Connect to WiFi Network</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="network-name" className="text-right">
                Network
              </Label>
              <div className="col-span-3 text-sm text-muted-foreground">
                {selectedNetwork?.ssid || '(Hidden Network)'}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="wifi-password" className="text-right">
                Password
              </Label>
              <div className="col-span-3 relative">
                <Input
                  id="wifi-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="pr-10"
                  placeholder="Enter WiFi password"
                  autoFocus
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleModalClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleConnect} 
              disabled={!password || isConnecting}
            >
              {isConnecting ? 'Connecting...' : 'Connect'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
