"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog"
import { Settings, Thermometer, Target } from "lucide-react"
import Link from "next/link"
import { useTemperatureData, useSetTemperatureTargets } from "./api/temperature"

interface ThermometerData {
  id: string
  name: string
  currentTemp: number
  targetTemp: number
}

export default function Dashboard() {
  const { data: tempData, isLoading, error, mutate } = useTemperatureData()
  const { setTargets } = useSetTemperatureTargets()
  const [isTargetModalOpen, setIsTargetModalOpen] = useState(false)
  const [editingThermometer, setEditingThermometer] = useState<ThermometerData | null>(null)
  const [newTargetTemp, setNewTargetTemp] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)

  // Convert API data to thermometer format
  const thermometers: ThermometerData[] = tempData ? [
    {
      id: "1",
      name: "Probe 1",
      currentTemp: tempData.temp_0,
      targetTemp: tempData.temp_0_target,
    },
    {
      id: "2", 
      name: "Probe 2",
      currentTemp: tempData.temp_1,
      targetTemp: tempData.temp_1_target,
    },
    {
      id: "3",
      name: "Probe 3", 
      currentTemp: tempData.temp_2,
      targetTemp: tempData.temp_2_target,
    },
    {
      id: "4",
      name: "Probe 4",
      currentTemp: tempData.temp_3,
      targetTemp: tempData.temp_3_target,
    },
  ] : []

  const handleTargetClick = (thermometer: ThermometerData) => {
    setEditingThermometer(thermometer)
    setNewTargetTemp(thermometer.targetTemp.toString())
    setIsTargetModalOpen(true)
  }

  const handleTargetUpdate = async () => {
    if (editingThermometer && newTargetTemp) {
      const temp = parseFloat(newTargetTemp)
      if (!isNaN(temp) && temp >= 0 && temp <= 300) {
        setIsUpdating(true)
        try {
          // Update the specific probe target
          const probeIndex = parseInt(editingThermometer.id) - 1
          const targets = {
            temp_0: probeIndex === 0 ? temp : tempData?.temp_0_target || 0,
            temp_1: probeIndex === 1 ? temp : tempData?.temp_1_target || 0,
            temp_2: probeIndex === 2 ? temp : tempData?.temp_2_target || 0,
            temp_3: probeIndex === 3 ? temp : tempData?.temp_3_target || 0,
          }
          
          await setTargets(targets)
          await mutate() // Refresh data
          setIsTargetModalOpen(false)
          setEditingThermometer(null)
          setNewTargetTemp("")
        } catch (error) {
          console.error('Failed to update target temperature:', error)
        } finally {
          setIsUpdating(false)
        }
      }
    }
  }

  const handleModalClose = () => {
    setIsTargetModalOpen(false)
    setEditingThermometer(null)
    setNewTargetTemp("")
  }



  return (
    <div className="min-h-screen bg-blue-100 dark:bg-blue-900/20 p-3 sm:p-6 overflow-x-hidden relative">
      
      <div className="max-w-7xl mx-auto w-full relative z-10">
        {/* Header */}
        <div className="mb-8 sm:mb-12 text-center">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-xl">
              <Thermometer className="h-8 w-8" />
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-blue-200 dark:text-blue-800">
              IoT BBQ Thermometer
            </h1>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <Card className="mb-8">
            <CardContent className="p-6 text-center">
              <p className="text-destructive">Failed to load temperature data</p>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {isLoading && !error && (
          <Card className="mb-8">
            <CardContent className="p-6 text-center">
              <div className="h-8 w-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-muted-foreground">Loading temperature data...</p>
            </CardContent>
          </Card>
        )}

        {/* Thermometer Grid */}
        {!isLoading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
            {thermometers.map((thermo) => {
            
            return (
              <Card key={thermo.id} className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 border-0 bg-blue-200 dark:bg-blue-800/40 h-fit">
                {/* Decorative gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 via-blue-500/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <CardHeader className="pb-4 relative">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg">
                      <Thermometer className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                      {thermo.name}
                    </CardTitle>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 relative">
                  {/* Temperature Display */}
                  <div className="flex items-center justify-between h-[85px]">
                    <div className="text-center flex-1 min-w-0 flex flex-col justify-center">
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-0.5">Current</p>
                      <div className="text-center">
                        <div className="inline-block px-1.5 py-0.5">
                          <p className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 dark:text-white leading-none">
                            {Math.round(thermo.currentTemp)}°<span className="text-lg sm:text-xl font-bold text-gray-500 dark:text-gray-400 ml-1">C</span>
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="w-px h-10 sm:h-12 bg-gradient-to-b from-transparent via-gray-300 dark:via-gray-600 to-transparent mx-2 sm:mx-4 flex-shrink-0" />
                    
                    <div className="text-center flex-1 min-w-0 flex flex-col justify-center">
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-0.5 flex items-center gap-1 justify-center">
                        <Target className="h-3 w-3" />
                        Target
                      </p>
                      <div className="text-center">
                        <div 
                          className="inline-block px-1.5 py-0.5 rounded-md border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer transition-all duration-200 group"
                          onClick={() => handleTargetClick(thermo)}
                        >
                          <p className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-700 dark:text-gray-300 leading-none group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {thermo.targetTemp}°<span className="text-lg sm:text-xl font-bold text-gray-500 dark:text-gray-400 ml-1">C</span>
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0 opacity-0 group-hover:opacity-100 transition-opacity leading-none">
                            Click to change
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                </CardContent>
              </Card>
            )
          })}
          </div>
        )}

        {/* Settings Button */}
        <div className="flex justify-end">
          <Link href="/settings">
            <Button 
              variant="outline" 
              size="lg" 
              className="gap-3 px-6 py-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-700 hover:from-blue-100 hover:to-purple-100 dark:hover:from-blue-800/30 dark:hover:to-purple-800/30 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl group"
            >
              <Settings className="h-5 w-5 text-blue-600 dark:text-blue-400 group-hover:rotate-90 transition-transform duration-300" />
              <span className="font-semibold text-blue-700 dark:text-blue-300">Settings</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Target Temperature Edit Modal */}
      <Dialog open={isTargetModalOpen} onOpenChange={handleModalClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Change Target Temperature</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="thermometer-name" className="text-right">
                Thermometer
              </Label>
              <div className="col-span-3 text-sm text-muted-foreground">
                {editingThermometer?.name}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="target-temp" className="text-right">
                Target (°C)
              </Label>
              <Input
                id="target-temp"
                type="number"
                value={newTargetTemp}
                onChange={(e) => setNewTargetTemp(e.target.value)}
                className="col-span-3"
                min="0"
                max="300"
                step="0.1"
                placeholder="Enter target temperature"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleModalClose}>
              Cancel
            </Button>
            <Button onClick={handleTargetUpdate} disabled={isUpdating}>
              {isUpdating ? 'Updating...' : 'Update Target'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
