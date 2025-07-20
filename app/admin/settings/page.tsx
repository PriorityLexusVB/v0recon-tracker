"use client"

import { useState, useTransition } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Settings, Save, Loader2, Bell, Mail, Smartphone, Database, Shield } from "lucide-react"
import { toast } from "sonner"

export default function SystemSettingsPage() {
  const { user, isLoading } = useAuth()
  const [isPending, startTransition] = useTransition()

  // System settings state
  const [settings, setSettings] = useState({
    // General Settings
    systemName: "Recon Tracker",
    systemDescription: "Vehicle Reconditioning Management System",
    maintenanceMode: false,

    // Notification Settings
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    notificationFrequency: "immediate",

    // Integration Settings
    googleSheetsUrl: process.env.NEXT_PUBLIC_GOOGLE_SHEETS_URL || "",
    autoSyncInterval: "60",

    // Security Settings
    sessionTimeout: "480",
    passwordMinLength: "8",
    requireTwoFactor: false,

    // Performance Settings
    maxVehiclesPerPage: "50",
    cacheTimeout: "300",
    enableAnalytics: true,
  })

  const handleSaveSettings = () => {
    startTransition(async () => {
      try {
        // This would be replaced with actual API call to save settings
        await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate API call
        toast.success("Settings saved successfully")
      } catch (error) {
        console.error("Error saving settings:", error)
        toast.error("Failed to save settings")
      }
    })
  }

  const handleSettingChange = (key: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (user?.role !== "ADMIN") {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-red-600">Access denied. Admin privileges required.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Settings</h1>
          <p className="text-gray-600">Configure system preferences and integrations</p>
        </div>
        <Button onClick={handleSaveSettings} disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Settings
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              General Settings
            </CardTitle>
            <CardDescription>Basic system configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="systemName">System Name</Label>
              <Input
                id="systemName"
                value={settings.systemName}
                onChange={(e) => handleSettingChange("systemName", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="systemDescription">System Description</Label>
              <Textarea
                id="systemDescription"
                value={settings.systemDescription}
                onChange={(e) => handleSettingChange("systemDescription", e.target.value)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                <p className="text-sm text-gray-500">Temporarily disable user access</p>
              </div>
              <Switch
                id="maintenanceMode"
                checked={settings.maintenanceMode}
                onCheckedChange={(checked) => handleSettingChange("maintenanceMode", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Settings
            </CardTitle>
            <CardDescription>Configure system notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <div>
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-gray-500">Send email alerts</p>
                </div>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => handleSettingChange("emailNotifications", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                <div>
                  <Label>SMS Notifications</Label>
                  <p className="text-sm text-gray-500">Send SMS alerts</p>
                </div>
              </div>
              <Switch
                checked={settings.smsNotifications}
                onCheckedChange={(checked) => handleSettingChange("smsNotifications", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Push Notifications</Label>
                <p className="text-sm text-gray-500">Browser push notifications</p>
              </div>
              <Switch
                checked={settings.pushNotifications}
                onCheckedChange={(checked) => handleSettingChange("pushNotifications", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Integration Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Integration Settings
            </CardTitle>
            <CardDescription>Configure external integrations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="googleSheetsUrl">Google Sheets URL</Label>
              <Input
                id="googleSheetsUrl"
                value={settings.googleSheetsUrl}
                onChange={(e) => handleSettingChange("googleSheetsUrl", e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/..."
              />
              <p className="text-sm text-gray-500 mt-1">URL to your vAuto Google Sheet</p>
            </div>
            <div>
              <Label htmlFor="autoSyncInterval">Auto Sync Interval (minutes)</Label>
              <Input
                id="autoSyncInterval"
                type="number"
                value={settings.autoSyncInterval}
                onChange={(e) => handleSettingChange("autoSyncInterval", e.target.value)}
                min="5"
                max="1440"
              />
              <p className="text-sm text-gray-500 mt-1">How often to sync with Google Sheets</p>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security Settings
            </CardTitle>
            <CardDescription>Configure security preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
              <Input
                id="sessionTimeout"
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) => handleSettingChange("sessionTimeout", e.target.value)}
                min="30"
                max="1440"
              />
              <p className="text-sm text-gray-500 mt-1">Auto-logout inactive users</p>
            </div>
            <div>
              <Label htmlFor="passwordMinLength">Minimum Password Length</Label>
              <Input
                id="passwordMinLength"
                type="number"
                value={settings.passwordMinLength}
                onChange={(e) => handleSettingChange("passwordMinLength", e.target.value)}
                min="6"
                max="32"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Require Two-Factor Authentication</Label>
                <p className="text-sm text-gray-500">Enforce 2FA for all users</p>
              </div>
              <Switch
                checked={settings.requireTwoFactor}
                onCheckedChange={(checked) => handleSettingChange("requireTwoFactor", checked)}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Settings</CardTitle>
          <CardDescription>Optimize system performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="maxVehiclesPerPage">Vehicles Per Page</Label>
              <Input
                id="maxVehiclesPerPage"
                type="number"
                value={settings.maxVehiclesPerPage}
                onChange={(e) => handleSettingChange("maxVehiclesPerPage", e.target.value)}
                min="10"
                max="200"
              />
            </div>
            <div>
              <Label htmlFor="cacheTimeout">Cache Timeout (seconds)</Label>
              <Input
                id="cacheTimeout"
                type="number"
                value={settings.cacheTimeout}
                onChange={(e) => handleSettingChange("cacheTimeout", e.target.value)}
                min="60"
                max="3600"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Enable Analytics</Label>
                <p className="text-sm text-gray-500">Track usage metrics</p>
              </div>
              <Switch
                checked={settings.enableAnalytics}
                onCheckedChange={(checked) => handleSettingChange("enableAnalytics", checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      <div className="text-center py-4">
        <p className="text-sm text-gray-500">
          Changes will take effect immediately. Some settings may require a system restart.
        </p>
      </div>
    </div>
  )
}
