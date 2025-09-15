"use client"

import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { Switch } from "../../../components/ui/switch"
import { Plus, Trash2 } from "lucide-react"
import { ThermometerSettings } from "../types"

interface ThermometerSettingsProps {
  thermometers: ThermometerSettings[]
  onThermometersChange: (thermometers: ThermometerSettings[]) => void
}

export default function ThermometerSettingsComponent({ thermometers, onThermometersChange }: ThermometerSettingsProps) {
  const addThermometer = () => {
    const newId = (thermometers.length + 1).toString()
    const newThermometer: ThermometerSettings = {
      id: newId,
      name: `Thermometer ${newId}`,
      targetTemp: 160,
      alertEnabled: true,
      alertThreshold: 5,
    }
    onThermometersChange([...thermometers, newThermometer])
  }

  const removeThermometer = (id: string) => {
    onThermometersChange(thermometers.filter((t) => t.id !== id))
  }

  const updateThermometer = (id: string, updates: Partial<ThermometerSettings>) => {
    onThermometersChange(thermometers.map((t) => (t.id === id ? { ...t, ...updates } : t)))
  }

  return (
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
  )
}
