"use client"

import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Label } from "../../../components/ui/label"
import { Switch } from "../../../components/ui/switch"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "../../../components/theme-provider"
import { GlobalSettings } from "../types"

interface GlobalSettingsProps {
  settings: GlobalSettings
  onSettingsChange: (settings: GlobalSettings) => void
}

export default function GlobalSettingsComponent({ settings, onSettingsChange }: GlobalSettingsProps) {
  const { theme, setTheme } = useTheme()

  const handleThemeChange = (checked: boolean) => {
    const newTheme = checked ? "dark" : "light"
    setTheme(newTheme)
    onSettingsChange({ ...settings, theme: newTheme })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">Global Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">

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
              checked={settings.soundAlerts}
              onCheckedChange={(checked) => onSettingsChange({ ...settings, soundAlerts: checked })}
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
              checked={settings.emailNotifications}
              onCheckedChange={(checked) => onSettingsChange({ ...settings, emailNotifications: checked })}
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
            <div className="flex items-center gap-2">
              <div>
                <Label htmlFor="theme-toggle">Dark Mode</Label>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Switch between light and dark themes
                </p>
              </div>
              {theme === "dark" ? (
                <Moon className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Sun className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            <Switch
              id="theme-toggle"
              checked={theme === "dark"}
              onCheckedChange={handleThemeChange}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
