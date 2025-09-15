"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { Switch } from "../../../components/ui/switch"
import { Plus, Trash2, Loader2 } from "lucide-react"
import { ThermometerSettings } from "../types"
import { useTemperatureData, useSetTemperatureTargets } from "../../api/temperature"

interface ThermometerSettingsProps {
  thermometers: ThermometerSettings[]
  onThermometersChange: (thermometers: ThermometerSettings[]) => void
}

export default function ThermometerSettingsComponent({ thermometers, onThermometersChange }: ThermometerSettingsProps) {
  const { data: tempData, isLoading, error, mutate } = useTemperatureData()
  const { setTargets } = useSetTemperatureTargets()
  const [isUpdating, setIsUpdating] = useState(false)

  // Get target temperatures from API data
  const getTargetTemp = (probeId: string): number => {
    if (!tempData) return 0
    const probeIndex = parseInt(probeId) - 1
    switch (probeIndex) {
      case 0: return tempData.temp_0_target
      case 1: return tempData.temp_1_target
      case 2: return tempData.temp_2_target
      case 3: return tempData.temp_3_target
      default: return 0
    }
  }

  const addThermometer = () => {
    const newId = (thermometers.length + 1).toString()
    const newThermometer: ThermometerSettings = {
      id: newId,
      name: `Thermometer ${newId}`,
      targetTemp: getTargetTemp(newId),
      alertEnabled: true,
    }
    onThermometersChange([...thermometers, newThermometer])
  }

  const removeThermometer = (id: string) => {
    onThermometersChange(thermometers.filter((t) => t.id !== id))
  }

  const updateThermometer = (id: string, updates: Partial<ThermometerSettings>) => {
    onThermometersChange(thermometers.map((t) => (t.id === id ? { ...t, ...updates } : t)))
  }

  const updateTargetTemperature = async (probeId: string, newTemp: number) => {
    if (!tempData) return
    
    setIsUpdating(true)
    try {
      const probeIndex = parseInt(probeId) - 1
      const targets = {
        temp_0: probeIndex === 0 ? newTemp : tempData.temp_0_target,
        temp_1: probeIndex === 1 ? newTemp : tempData.temp_1_target,
        temp_2: probeIndex === 2 ? newTemp : tempData.temp_2_target,
        temp_3: probeIndex === 3 ? newTemp : tempData.temp_3_target,
      }
      
      await setTargets(targets)
      await mutate() // Refresh data to get updated targets
    } catch (error) {
      console.error('Failed to update target temperature:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Thermometer Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">Failed to load temperature data</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <CardTitle className="text-lg sm:text-xl">Thermometer Configuration</CardTitle>
        <Button 
          onClick={addThermometer} 
          size="sm" 
          className="gap-2 self-start sm:self-auto"
          disabled={isLoading}
        >
          <Plus className="h-4 w-4" />
          <span className="text-sm">Add Thermometer</span>
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span className="text-sm text-muted-foreground">Loading temperature data...</span>
          </div>
        )}
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
                  <Label className="text-sm">Target Temperature (°C)</Label>
                  <Input
                    type="number"
                    value={getTargetTemp(thermo.id)}
                    onChange={(e) => {
                      const value = e.target.value === "" ? 0 : Number(e.target.value)
                      if (!isNaN(value)) {
                        updateThermometer(thermo.id, { targetTemp: value })
                        // Send update to API immediately
                        updateTargetTemperature(thermo.id, value)
                      }
                    }}
                    min="0"
                    max="300"
                    className="text-sm"
                    disabled={isLoading || isUpdating}
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
                </div>
              </div>
            </div>
          </Card>
        ))}
      </CardContent>
    </Card>
  )
}
