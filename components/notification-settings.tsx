"use client"

import type React from "react"

import { useEffect, useState, useTransition } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { getUserProfile, updateNotificationSettings } from "@/app/actions/user"
import { useAuth } from "@/hooks/use-auth"

export function NotificationSettings() {
  const { user, isLoading: isLoadingAuth } = useAuth()
  const [emailNotifications, setEmailNotifications] = useState(false)
  const [smsNotifications, setSmsNotifications] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [isLoadingSettings, setIsLoadingSettings] = useState(true)

  useEffect(() => {
    if (user?.id) {
      fetchUserSettings(user.id)
    }
  }, [user?.id])

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
      } else {
        toast.error(result.message)
      }
    })
  }

  if (isLoadingAuth || isLoadingSettings) {
    return (
      <Card>
        <CardContent className="pt-6 flex items-center justify-center h-32">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="ml-4 text-gray-600">Loading settings...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Settings</CardTitle>
        <CardDescription>Manage your notification preferences.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center justify-between">
            <Label htmlFor="email-notifications">Email Notifications</Label>
            <Switch
              id="email-notifications"
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
              disabled={isPending}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="sms-notifications">SMS Notifications</Label>
            <Switch
              id="sms-notifications"
              checked={smsNotifications}
              onCheckedChange={setSmsNotifications}
              disabled={isPending}
            />
          </div>
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
        </form>
      </CardContent>
    </Card>
  )
}
