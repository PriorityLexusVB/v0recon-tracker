"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useNotificationStore } from "@/lib/notification-store"
import { toast } from "sonner"

interface NotificationSettingsModalProps {
  onClose: () => void
}

export default function NotificationSettingsModal({ onClose }: NotificationSettingsModalProps) {
  const { preferences, setPreference, resetPreferences } = useNotificationStore()
  const [localPreferences, setLocalPreferences] = useState(preferences)

  useEffect(() => {
    setLocalPreferences(preferences)
  }, [preferences])

  const handleSave = () => {
    // In a real app, you'd persist these to a database
    // For now, zustand with persist middleware handles local storage
    toast.success("Notification settings saved!")
    onClose()
  }

  const handleReset = () => {
    resetPreferences()
    toast.info("Notification settings reset to defaults.")
  }

  const handlePreferenceChange = (category: keyof typeof preferences, key: string, value: any) => {
    setLocalPreferences((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value,
      },
    }))
    setPreference(category, key, value) // Update global store immediately
  }

  const requestBrowserNotificationPermission = () => {
    if (!("Notification" in window)) {
      toast.error("Browser notifications not supported by your browser.")
      return
    }
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        toast.success("Browser notification permission granted!")
      } else {
        toast.warning("Browser notification permission denied or blocked.")
      }
    })
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Notification Settings</DialogTitle>
          <DialogDescription>Configure how you receive alerts and updates.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          {/* Browser Notifications */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Browser Notifications</h3>
            <div className="flex items-center justify-between">
              <Label htmlFor="browser-enabled">Enable Desktop Notifications</Label>
              <Switch
                id="browser-enabled"
                checked={localPreferences.browser.enabled}
                onCheckedChange={(checked) => {
                  handlePreferenceChange("browser", "enabled", checked)
                  if (checked) requestBrowserNotificationPermission()
                }}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="browser-sound">Play Sound for Alerts</Label>
              <Switch
                id="browser-sound"
                checked={localPreferences.browser.sound}
                onCheckedChange={(checked) => handlePreferenceChange("browser", "sound", checked)}
              />
            </div>
          </div>

          {/* Email Notifications */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Email Notifications (via EmailJS)</h3>
            <div className="flex items-center justify-between">
              <Label htmlFor="email-enabled">Enable Email Alerts</Label>
              <Switch
                id="email-enabled"
                checked={localPreferences.email.enabled}
                onCheckedChange={(checked) => handlePreferenceChange("email", "enabled", checked)}
              />
            </div>
            <div className="space-y-2 mt-2">
              <Label htmlFor="recipient-email">Recipient Email</Label>
              <Input
                id="recipient-email"
                type="email"
                placeholder="your.email@example.com"
                value={localPreferences.email.recipientEmail}
                onChange={(e) => handlePreferenceChange("email", "recipientEmail", e.target.value)}
              />
            </div>
            <div className="space-y-2 mt-2">
              <Label htmlFor="recipient-name">Recipient Name</Label>
              <Input
                id="recipient-name"
                placeholder="John Doe"
                value={localPreferences.email.recipientName}
                onChange={(e) => handlePreferenceChange("email", "recipientName", e.target.value)}
              />
            </div>
            <div className="space-y-2 mt-2">
              <Label htmlFor="emailjs-service-id">EmailJS Service ID</Label>
              <Input
                id="emailjs-service-id"
                placeholder="service_xxxxxx"
                value={localPreferences.email.serviceId}
                onChange={(e) => handlePreferenceChange("email", "serviceId", e.target.value)}
              />
            </div>
            <div className="space-y-2 mt-2">
              <Label htmlFor="emailjs-template-id">EmailJS Template ID (Alerts)</Label>
              <Input
                id="emailjs-template-id"
                placeholder="template_xxxxxx"
                value={localPreferences.email.templateId}
                onChange={(e) => handlePreferenceChange("email", "templateId", e.target.value)}
              />
            </div>
            <div className="space-y-2 mt-2">
              <Label htmlFor="emailjs-reset-template-id">EmailJS Template ID (Password Reset)</Label>
              <Input
                id="emailjs-reset-template-id"
                placeholder="template_reset_password"
                value={process.env.NEXT_PUBLIC_EMAILJS_RESET_TEMPLATE_ID || ""} // This is read from env, not user input
                disabled
              />
            </div>
            <div className="space-y-2 mt-2">
              <Label htmlFor="emailjs-public-key">EmailJS Public Key</Label>
              <Input
                id="emailjs-public-key"
                placeholder="YOUR_PUBLIC_KEY"
                value={localPreferences.email.publicKey}
                onChange={(e) => handlePreferenceChange("email", "publicKey", e.target.value)}
              />
            </div>
          </div>

          {/* Webhook Notifications */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Webhook Notifications (e.g., Discord, Slack)</h3>
            <div className="flex items-center justify-between">
              <Label htmlFor="webhook-enabled">Enable Webhook Alerts</Label>
              <Switch
                id="webhook-enabled"
                checked={localPreferences.webhook.enabled}
                onCheckedChange={(checked) => handlePreferenceChange("webhook", "enabled", checked)}
              />
            </div>
            <div className="space-y-2 mt-2">
              <Label htmlFor="webhook-url">Webhook URL</Label>
              <Input
                id="webhook-url"
                type="url"
                placeholder="https://discord.com/api/webhooks/..."
                value={localPreferences.webhook.url}
                onChange={(e) => handlePreferenceChange("webhook", "url", e.target.value)}
              />
            </div>
          </div>

          {/* Escalation Settings */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Escalation Settings</h3>
            <div className="flex items-center justify-between">
              <Label htmlFor="escalation-enabled">Enable Escalation</Label>
              <Switch
                id="escalation-enabled"
                checked={localPreferences.escalation.enabled}
                onCheckedChange={(checked) => handlePreferenceChange("escalation", "enabled", checked)}
              />
            </div>
            {localPreferences.escalation.enabled && (
              <>
                <div className="space-y-2 mt-2">
                  <Label htmlFor="manager-email">Manager Email for Escalation</Label>
                  <Input
                    id="manager-email"
                    type="email"
                    placeholder="manager@example.com"
                    value={localPreferences.escalation.managerEmail}
                    onChange={(e) => handlePreferenceChange("escalation", "managerEmail", e.target.value)}
                  />
                </div>
                <div className="space-y-2 mt-2">
                  <Label htmlFor="escalation-delay">Escalation Delay (minutes)</Label>
                  <Input
                    id="escalation-delay"
                    type="number"
                    min="1"
                    value={localPreferences.escalation.escalationDelayMinutes}
                    onChange={(e) =>
                      handlePreferenceChange("escalation", "escalationDelayMinutes", Number.parseInt(e.target.value))
                    }
                  />
                </div>
              </>
            )}
          </div>

          {/* Quiet Hours */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Quiet Hours</h3>
            <div className="flex items-center justify-between">
              <Label htmlFor="quiet-hours-enabled">Enable Quiet Hours</Label>
              <Switch
                id="quiet-hours-enabled"
                checked={localPreferences.quietHours.enabled}
                onCheckedChange={(checked) => handlePreferenceChange("quietHours", "enabled", checked)}
              />
            </div>
            {localPreferences.quietHours.enabled && (
              <div className="flex gap-4 mt-2">
                <div className="space-y-2 flex-1">
                  <Label htmlFor="quiet-hours-start">Start Time</Label>
                  <Input
                    id="quiet-hours-start"
                    type="time"
                    value={localPreferences.quietHours.start}
                    onChange={(e) => handlePreferenceChange("quietHours", "start", e.target.value)}
                  />
                </div>
                <div className="space-y-2 flex-1">
                  <Label htmlFor="quiet-hours-end">End Time</Label>
                  <Input
                    id="quiet-hours-end"
                    type="time"
                    value={localPreferences.quietHours.end}
                    onChange={(e) => handlePreferenceChange("quietHours", "end", e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={handleReset}>
            Reset to Defaults
          </Button>
          <Button onClick={handleSave}>Save Settings</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
