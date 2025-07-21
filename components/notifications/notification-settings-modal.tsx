"use client"

import type React from "react"

import { useState, useEffect, useTransition } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Loader2, Settings } from "lucide-react"
import { toast } from "sonner"
import { getUserProfile, updateNotificationSettings } from "@/app/actions/user"
import { useAuth } from "@/hooks/use-auth"

export function NotificationSettingsModal() {
  const { user, isLoading: isLoadingAuth } = useAuth()
  const [emailNotifications, setEmailNotifications] = useState(false)
  const [smsNotifications, setSmsNotifications] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [isLoadingSettings, setIsLoadingSettings] = useState(true)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (user?.id && isOpen) {
      fetchUserSettings(user.id)
    }
  }, [user?.id, isOpen])

  const fetchUserSettings = async (userId: string) => {
    setIsLoadingSettings(true)
    try {
      const profile = await getUserProfile(userId)
      if (profile) {
        setEmailNotifications(profile.emailNotificationsEnabled || false)
        setSmsNotifications(profile.smsNotificationsEnabled || false)
      }
    } catch (error) {
      console.error("Failed to fetch user settings:", error)
      toast.error("Failed to load notification settings.")
    } finally {
      setIsLoadingSettings(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id) {
      toast.error("User not authenticated.")
      return
    }

    startTransition(async () => {
      const formData = new FormData()
      formData.append("emailNotifications", emailNotifications ? "on" : "off")
      formData.append("smsNotifications", smsNotifications ? "on" : "off")

      const result = await updateNotificationSettings(user.id, formData)
      if (result.success) {
        toast.success(result.message)
        setIsOpen(false) // Close modal on success
      } else {
        toast.error(result.message)
      }
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="mr-2 h-4 w-4" /> Notification Settings
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Notification Preferences</DialogTitle>
          <DialogDescription>Manage how you receive alerts and updates.</DialogDescription>
        </DialogHeader>
        {isLoadingAuth || isLoadingSettings ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <p className="ml-4 text-gray-600">Loading settings...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 py-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="modal-email-notifications">Email Notifications</Label>
              <Switch
                id="modal-email-notifications"
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
                disabled={isPending}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="modal-sms-notifications">SMS Notifications</Label>
              <Switch
                id="modal-sms-notifications"
                checked={smsNotifications}
                onCheckedChange={setSmsNotifications}
                disabled={isPending}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
