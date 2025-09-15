"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { useTemperatureData, useSetTemperatureTargets } from "../app/api/temperature"
import { Thermometer, Target, RefreshCw } from "lucide-react"

interface TemperatureMonitorProps {
  className?: string
}

export default function TemperatureMonitor({ className }: TemperatureMonitorProps) {
  const { data: tempData, isLoading, error, mutate } = useTemperatureData()
  const { setTargets } = useSetTemperatureTargets()
  const [targets, setTargetsLocal] = useState({
    temp_0: 0,
    temp_1: 0,
    temp_2: 0,
    temp_3: 0,
  })
  const [isUpdating, setIsUpdating] = useState(false)

  const handleTargetChange = (probe: keyof typeof targets, value: string) => {
    const numValue = parseFloat(value) || 0
    setTargetsLocal(prev => ({ ...prev, [probe]: numValue }))
  }

  const updateTargets = async () => {
    setIsUpdating(true)
    try {
      await setTargets(targets)
      // Refresh temperature data to get updated targets
      await mutate()
    } catch (error) {
      console.error('Failed to update temperature targets:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const refreshData = async () => {
    await mutate()
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <p className="text-destructive">Failed to load temperature data</p>
          <Button onClick={refreshData} variant="outline" className="mt-2">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
          <Thermometer className="h-5 w-5" />
          Temperature Monitor
          <Button
            onClick={refreshData}
            variant="outline"
            size="sm"
            disabled={isLoading}
            className="ml-auto"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? (
          <div className="text-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p className="text-muted-foreground">Loading temperature data...</p>
          </div>
        ) : tempData ? (
          <>
            {/* Current Temperatures */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[0, 1, 2, 3].map((probe) => (
                <div key={probe} className="space-y-2">
                  <Label className="text-sm font-medium">Probe {probe + 1}</Label>
                  <div className="p-3 border rounded-lg bg-muted/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold">
                          {tempData[`temp_${probe}` as keyof typeof tempData]}°C
                        </p>
                        <p className="text-xs text-muted-foreground">Current</p>
                      </div>
                      <Thermometer className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="mt-2 pt-2 border-t">
                      <p className="text-sm">
                        Target: {tempData[`temp_${probe}_target` as keyof typeof tempData]}°C
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Target Temperature Controls */}
            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                <Label className="text-sm font-medium">Set Target Temperatures</Label>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[0, 1, 2, 3].map((probe) => (
                  <div key={probe} className="space-y-2">
                    <Label htmlFor={`target-${probe}`}>Probe {probe + 1} Target (°C)</Label>
                    <Input
                      id={`target-${probe}`}
                      type="number"
                      value={targets[`temp_${probe}` as keyof typeof targets]}
                      onChange={(e) => handleTargetChange(`temp_${probe}` as keyof typeof targets, e.target.value)}
                      placeholder="0"
                      step="0.1"
                    />
                  </div>
                ))}
              </div>

              <Button
                onClick={updateTargets}
                disabled={isUpdating}
                className="w-full"
              >
                {isUpdating ? 'Updating...' : 'Update Target Temperatures'}
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No temperature data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
