"use client"

import { useTransition } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Save, RefreshCw, Mail, MessageSquare, FileSpreadsheet, Database, Loader2 } from "lucide-react"
import { updateSettings, fetchSettings } from "@/app/actions/settings"
import { Suspense } from "react"
import { toast } from "sonner"

export const dynamic = "force-dynamic"

async function SettingsForm() {
  const { settings, success, message } = await fetchSettings()

  if (!success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] p-4">
        <h2 className="text-2xl font-bold text-red-600">Error Loading Settings</h2>
        <p className="text-gray-600 mt-2">{message}</p>
      </div>
    )
  }

  const handleSubmit = async (formData: FormData) => {
    const result = await updateSettings(formData)
    if (result.success) {
      toast.success(result.message)
    } else {
      toast.error(result.message || "Failed to save settings.")
    }
  }

  return (
    <form action={handleSubmit} className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" /> Email Notification Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="email-enabled">Enable Email Notifications</Label>
            <Switch id="email-enabled" name="emailEnabled" defaultChecked={settings?.emailEnabled || false} />
          </div>
          <div>
            <Label htmlFor="email-from-address">Default From Address</Label>
            <Input
              id="email-from-address"
              name="emailFromAddress"
              defaultValue={settings?.emailFromAddress || "noreply@recontracker.com"}
              placeholder="noreply@yourdomain.com"
            />
          </div>
          <div>
            <Label htmlFor="email-signature">Email Signature</Label>
            <Textarea
              id="email-signature"
              name="emailSignature"
              defaultValue={settings?.emailSignature || "Best regards,\nThe Recon Tracker Team"}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" /> SMS Notification Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="sms-enabled">Enable SMS Notifications</Label>
            <Switch id="sms-enabled" name="smsEnabled" defaultChecked={settings?.smsEnabled || false} />
          </div>
          <div>
            <Label htmlFor="sms-provider">SMS Provider</Label>
            <Select name="smsProvider" defaultValue={settings?.smsProvider || "NONE"}>
              <SelectTrigger>
                <SelectValue placeholder="Select SMS Provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NONE">None</SelectItem>
                <SelectItem value="TWILIO">Twilio</SelectItem>
                {/* Add other providers as needed */}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="sms-from-number">Twilio From Number</Label>
            <Input
              id="sms-from-number"
              name="smsFromNumber"
              defaultValue={settings?.smsFromNumber || ""}
              placeholder="+15017122661"
            />
            <p className="text-sm text-muted-foreground mt-1">Your Twilio phone number (e.g., +15017122661).</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" /> Google Sheets Integration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="google-sheets-sync-enabled">Enable Google Sheets Sync</Label>
            <Switch
              id="google-sheets-sync-enabled"
              name="googleSheetsSyncEnabled"
              defaultChecked={settings?.googleSheetsSyncEnabled || false}
            />
          </div>
          <div>
            <Label htmlFor="google-sheets-url">Google Sheets URL</Label>
            <Input
              id="google-sheets-url"
              name="googleSheetsUrl"
              defaultValue={settings?.googleSheetsUrl || ""}
              placeholder="https://docs.google.com/spreadsheets/d/..."
            />
            <p className="text-sm text-muted-foreground mt-1">
              The public URL of your Google Sheet for vehicle data import.
            </p>
          </div>
          <div>
            <Label htmlFor="google-sheets-last-sync">Last Sync Time</Label>
            <Input
              id="google-sheets-last-sync"
              value={
                settings?.googleSheetsLastSync ? new Date(settings.googleSheetsLastSync).toLocaleString() : "Never"
              }
              readOnly
              disabled
            />
            <p className="text-sm text-muted-foreground mt-1">Automatically updated after each successful sync.</p>
          </div>
          <Button type="button" variant="outline" className="w-full bg-transparent">
            <RefreshCw className="mr-2 h-4 w-4" /> Trigger Manual Sync
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" /> Database & Data Retention
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="data-retention-days">Timeline Event Retention (Days)</Label>
            <Input
              id="data-retention-days"
              name="dataRetentionDays"
              type="number"
              defaultValue={settings?.dataRetentionDays || 365}
              min={30}
              placeholder="365"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Number of days to retain detailed timeline events. Older events will be archived or deleted.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit">
          <Save className="mr-2 h-4 w-4" /> Save Settings
        </Button>
      </div>
    </form>
  )
}

export default function AdminSettingsPage() {
  const { user, isLoading } = useAuth()
  const [isPending, startTransition] = useTransition()

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
    <div className="flex flex-col gap-6 p-6">
      <h1 className="text-3xl font-bold">Application Settings</h1>
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-2">Loading settings...</p>
          </div>
        }
      >
        <SettingsForm />
      </Suspense>
    </div>
  )
}
