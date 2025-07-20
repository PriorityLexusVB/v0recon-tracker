"use client"

import { useState, useTransition } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { User, Edit, Save, Bell, Moon, Sun, Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function SettingsPage() {
  const { user, isLoading } = useAuth()
  const [isPending, startTransition] = useTransition()
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false)
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false)

  // User profile state
  const [profile, setProfile] = useState({
    name: user?.name || "",
    email: user?.email || "",
    department: user?.department || "",
    bio: "",
    phone: "",
  })

  // User preferences state
  const [preferences, setPreferences] = useState({
    theme: "system",
    notifications: true,
    emailAlerts: true,
    smsAlerts: false,
    language: "en",
    timezone: "America/New_York",
    dashboardLayout: "cards",
  })

  const handleUpdateProfile = (formData: FormData) => {
    startTransition(async () => {
      try {
        // This would be replaced with actual API call
        const name = formData.get("name") as string
        const department = formData.get("department") as string
        const bio = formData.get("bio") as string
        const phone = formData.get("phone") as string

        setProfile((prev) => ({
          ...prev,
          name,
          department,
          bio,
          phone,
        }))

        toast.success("Profile updated successfully")
        setIsEditProfileOpen(false)
      } catch (error) {
        console.error("Error updating profile:", error)
        toast.error("Failed to update profile")
      }
    })
  }

  const handleUpdatePreferences = () => {
    startTransition(async () => {
      try {
        // This would be replaced with actual API call
        await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate API call
        toast.success("Preferences updated successfully")
        setIsPreferencesOpen(false)
      } catch (error) {
        console.error("Error updating preferences:", error)
        toast.error("Failed to update preferences")
      }
    })
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-red-600">Please sign in to access settings.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium">Name</p>
              <p className="text-sm text-muted-foreground">{profile.name || "Not set"}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Email</p>
              <p className="text-sm text-muted-foreground">{profile.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Role</p>
              <p className="text-sm text-muted-foreground">{user.role}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Department</p>
              <p className="text-sm text-muted-foreground">{profile.department || "Not assigned"}</p>
            </div>
            {profile.phone && (
              <div>
                <p className="text-sm font-medium">Phone</p>
                <p className="text-sm text-muted-foreground">{profile.phone}</p>
              </div>
            )}
            {profile.bio && (
              <div>
                <p className="text-sm font-medium">Bio</p>
                <p className="text-sm text-muted-foreground">{profile.bio}</p>
              </div>
            )}

            <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Profile</DialogTitle>
                  <DialogDescription>Update your profile information</DialogDescription>
                </DialogHeader>
                <form action={handleUpdateProfile} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" name="name" defaultValue={profile.name} placeholder="Enter your full name" />
                  </div>
                  <div>
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      name="department"
                      defaultValue={profile.department}
                      placeholder="Enter your department"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" name="phone" defaultValue={profile.phone} placeholder="Enter your phone number" />
                  </div>
                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea id="bio" name="bio" defaultValue={profile.bio} placeholder="Tell us about yourself" />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsEditProfileOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isPending}>
                      {isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Preferences
            </CardTitle>
            <CardDescription>Customize your experience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Theme</p>
                <p className="text-sm text-muted-foreground">
                  {preferences.theme === "system"
                    ? "System default"
                    : preferences.theme === "dark"
                      ? "Dark mode"
                      : "Light mode"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Sun className="h-4 w-4" />
                <Moon className="h-4 w-4" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Notifications</p>
                <p className="text-sm text-muted-foreground">{preferences.notifications ? "Enabled" : "Disabled"}</p>
              </div>
              <Bell className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-medium">Dashboard Layout</p>
              <p className="text-sm text-muted-foreground">
                {preferences.dashboardLayout === "cards" ? "Card view" : "Table view"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Language</p>
              <p className="text-sm text-muted-foreground">English</p>
            </div>

            <Dialog open={isPreferencesOpen} onOpenChange={setIsPreferencesOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Edit className="mr-2 h-4 w-4" />
                  Update Preferences
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Update Preferences</DialogTitle>
                  <DialogDescription>Customize your application experience</DialogDescription>
                </DialogHeader>
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="theme">Theme</Label>
                    <Select
                      value={preferences.theme}
                      onValueChange={(value) => setPreferences((prev) => ({ ...prev, theme: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="system">System</SelectItem>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive browser notifications</p>
                    </div>
                    <Switch
                      checked={preferences.notifications}
                      onCheckedChange={(checked) => setPreferences((prev) => ({ ...prev, notifications: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Email Alerts</Label>
                      <p className="text-sm text-muted-foreground">Receive email notifications</p>
                    </div>
                    <Switch
                      checked={preferences.emailAlerts}
                      onCheckedChange={(checked) => setPreferences((prev) => ({ ...prev, emailAlerts: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>SMS Alerts</Label>
                      <p className="text-sm text-muted-foreground">Receive SMS notifications</p>
                    </div>
                    <Switch
                      checked={preferences.smsAlerts}
                      onCheckedChange={(checked) => setPreferences((prev) => ({ ...prev, smsAlerts: checked }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="dashboardLayout">Dashboard Layout</Label>
                    <Select
                      value={preferences.dashboardLayout}
                      onValueChange={(value) => setPreferences((prev) => ({ ...prev, dashboardLayout: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cards">Card View</SelectItem>
                        <SelectItem value="table">Table View</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsPreferencesOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleUpdatePreferences} disabled={isPending}>
                      {isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Preferences
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>

      {/* Account Security */}
      <Card>
        <CardHeader>
          <CardTitle>Account Security</CardTitle>
          <CardDescription>Manage your account security settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Password</p>
              <p className="text-sm text-muted-foreground">Last changed 30 days ago</p>
            </div>
            <Button variant="outline">Change Password</Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Two-Factor Authentication</p>
              <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
            </div>
            <Button variant="outline">Enable 2FA</Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Active Sessions</p>
              <p className="text-sm text-muted-foreground">Manage your active sessions</p>
            </div>
            <Button variant="outline">View Sessions</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
