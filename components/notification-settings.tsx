"use client"

import { useState } from "react"
import { X, Volume2, VolumeX, Monitor, MonitorX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { useNotificationStore } from "@/lib/notification-store"

interface NotificationSettingsProps {
  onClose: () => void
}

export default function NotificationSettings({ onClose }: NotificationSettingsProps) {
  const { settings, updateSettings, requestPermission, permissionGranted } = useNotificationStore()
  const [localSettings, setLocalSettings] = useState(settings)

  const handleSave = () => {
    updateSettings(localSettings)
    onClose()
  }

  const handlePermissionRequest = async () => {
    await requestPermission()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg font-semibold">Notification Settings</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Browser Notifications */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {permissionGranted ? (
                  <Monitor className="h-4 w-4 text-green-600" />
                ) : (
                  <MonitorX className="h-4 w-4 text-gray-400" />
                )}
                <Label htmlFor="browser-notifications">Browser Notifications</Label>
              </div>
              <Switch
                id="browser-notifications"
                checked={localSettings.browserNotifications && permissionGranted}
                onCheckedChange={(checked) => {
                  if (checked && !permissionGranted) {
                    handlePermissionRequest()
                  }
                  setLocalSettings({ ...localSettings, browserNotifications: checked })
                }}
              />
            </div>
            {!permissionGranted && (
              <div className="text-xs text-gray-500 ml-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePermissionRequest}
                  className="h-7 text-xs bg-transparent"
                >
                  Enable Browser Notifications
                </Button>
              </div>
            )}
          </div>

          {/* Sound Notifications */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {localSettings.soundEnabled ? (
                <Volume2 className="h-4 w-4 text-blue-600" />
              ) : (
                <VolumeX className="h-4 w-4 text-gray-400" />
              )}
              <Label htmlFor="sound-notifications">Sound Notifications</Label>
            </div>
            <Switch
              id="sound-notifications"
              checked={localSettings.soundEnabled}
              onCheckedChange={(checked) => setLocalSettings({ ...localSettings, soundEnabled: checked })}
            />
          </div>

          {/* Notification Types */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900">Notification Types</h4>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm">🚨</span>
                  <Label htmlFor="overdue-notifications">Overdue Alerts</Label>
                </div>
                <Switch
                  id="overdue-notifications"
                  checked={localSettings.overdueEnabled}
                  onCheckedChange={(checked) => setLocalSettings({ ...localSettings, overdueEnabled: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm">⚠️</span>
                  <Label htmlFor="warning-notifications">Due Soon Warnings</Label>
                </div>
                <Switch
                  id="warning-notifications"
                  checked={localSettings.warningEnabled}
                  onCheckedChange={(checked) => setLocalSettings({ ...localSettings, warningEnabled: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm">✅</span>
                  <Label htmlFor="milestone-notifications">Completion Updates</Label>
                </div>
                <Switch
                  id="milestone-notifications"
                  checked={localSettings.milestoneEnabled}
                  onCheckedChange={(checked) => setLocalSettings({ ...localSettings, milestoneEnabled: checked })}
                />
              </div>
            </div>
          </div>

          {/* Timing Settings */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900">Timing Settings</h4>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="overdue-threshold" className="text-sm">
                  Overdue after (days)
                </Label>
                <Input
                  id="overdue-threshold"
                  type="number"
                  min="0"
                  max="30"
                  value={localSettings.overdueThreshold}
                  onChange={(e) =>
                    setLocalSettings({
                      ...localSettings,
                      overdueThreshold: Number.parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-20 h-8"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="warning-threshold" className="text-sm">
                  Warn before due (days)
                </Label>
                <Input
                  id="warning-threshold"
                  type="number"
                  min="0"
                  max="7"
                  value={localSettings.warningThreshold}
                  onChange={(e) =>
                    setLocalSettings({
                      ...localSettings,
                      warningThreshold: Number.parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-20 h-8"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button onClick={handleSave} className="flex-1">
              Save Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
