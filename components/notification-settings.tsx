"use client"

import { useEffect } from "react"

import { useState, useTransition } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Loader2, Mail } from "lucide-react"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getDefaultEmailPreferences } from "@/lib/email-service" // Assuming this utility exists
import { useAuth } from "@/hooks/use-auth"
import { updateUserNotificationPreferences } from "@/app/actions/users" // Assuming this action exists

type NotificationSettingsProps = {}

export function NotificationSettings({}: NotificationSettingsProps) {
  const { user, isLoading: isUserLoading } = useAuth();
  const [isPending, startTransition] = useTransition();
  const [emailEnabled, setEmailEnabled] = useState(true); // Default from getDefaultEmailPreferences
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailFrequency, setEmailFrequency] = useState<'immediate' | 'daily' | 'weekly'>('immediate');

  // Load initial settings from user preferences or defaults
  useEffect(() => {
    if (user) {
      // In a real app, fetch user's saved preferences from DB
      // For now, use defaults or mock saved preferences
      setEmailEnabled(user.emailPreferences?.enabled ?? getDefaultEmailPreferences().enabled);
      setEmailFrequency(user.emailPreferences?.frequency ?? getDefaultEmailPreferences().frequency);
      // Assuming SMS/Push preferences would also be part of user model
      setSmsEnabled(false); // Placeholder
      setPushEnabled(true); // Placeholder
    }
  }, [user]);

  const handleSavePreferences = () => {
    if (!user) {
      toast.error("You must be logged in to save preferences.");
      return;
    }

    startTransition(async () => {
      try {
        // Construct the preferences object to save
        const preferences = {
          emailPreferences: {
            enabled: emailEnabled,
            frequency: emailFrequency,
            types: getDefaultEmailPreferences().types, // Assuming types are fixed for now
          },
          // Add SMS and Push preferences here if they are part of the user model
        };

        // Call a server action to update user preferences
        const result = await updateUserNotificationPreferences(user.id, preferences);

        if (result.success) {
          toast.success("Notification preferences saved successfully.");
        } else {
          toast.error(result.message || "Failed to save preferences.");
        }
      } catch (error) {
        console.error("Error saving notification preferences:", error);
        toast.error("An unexpected error occurred while saving preferences.");
      }
    });
  };

  if (isUserLoading) {
    return (
      <Card className="h-[300px] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-2">Loading preferences...</p>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>Manage how you receive updates and alerts.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive updates via email.</p>
              </div>
            </div>
            <Switch
              id="email-notifications"
              checked={emailEnabled}
              onCheckedChange={setEmailEnabled}
              disabled={isPending}
            />
          </div>
          {emailEnabled && (
            <div className="ml-7">
              <Label htmlFor="email-frequency">Email Frequency</Label>
              <Select value={emailFrequency} onValueChange={(value: 'immediate' | 'daily' | 'weekly') => setEmailFrequency(value)} disabled={isPending}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediate">Immediate</SelectItem>
                  <SelectItem value="daily">Daily Digest</SelectItem>
                  <SelectItem value="weekly">Weekly Summary</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              \
