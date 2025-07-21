"use client"

import type React from "react"

import { useEffect, useState, useTransition } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { getSystemSettings, updateSystemSetting } from "@/app/actions/settings"

interface SystemSettings {
  max_days_in_shop: number
  max_days_in_detail: number
  max_days_in_photo: number
}

export function TimelineGoalsSettings() {
  const [settings, setSettings] = useState<SystemSettings>({
    max_days_in_shop: 0,
    max_days_in_detail: 0,
    max_days_in_photo: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    setIsLoading(true)
    try {
      const fetchedSettings = await getSystemSettings()
      setSettings({
        max_days_in_shop: Number.parseInt(fetchedSettings.find((s) => s.key === "max_days_in_shop")?.value || "0"),
        max_days_in_detail: Number.parseInt(fetchedSettings.find((s) => s.key === "max_days_in_detail")?.value || "0"),
        max_days_in_photo: Number.parseInt(fetchedSettings.find((s) => s.key === "max_days_in_photo")?.value || "0"),
      })
    } catch (error) {
      console.error("Failed to fetch system settings:", error)
      toast.error("Failed to load timeline goals.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setSettings((prev) => ({
      ...prev,
      [id]: Number.parseInt(value) || 0,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      try {
        await updateSystemSetting("max_days_in_shop", settings.max_days_in_shop.toString())
        await updateSystemSetting("max_days_in_detail", settings.max_days_in_detail.toString())
        await updateSystemSetting("max_days_in_photo", settings.max_days_in_photo.toString())
        toast.success("Timeline goals updated successfully!")
      } catch (error) {
        console.error("Failed to update timeline goals:", error)
        toast.error("Failed to update timeline goals.")
      }
    })
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6 flex items-center justify-center h-32">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="ml-4 text-gray-600">Loading goals...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Timeline Goals</CardTitle>
        <CardDescription>Set target days for each reconditioning stage.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="max_days_in_shop">Max Days in Shop</Label>
            <Input
              id="max_days_in_shop"
              type="number"
              value={settings.max_days_in_shop}
              onChange={handleChange}
              min="0"
              disabled={isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="max_days_in_detail">Max Days in Detail</Label>
            <Input
              id="max_days_in_detail"
              type="number"
              value={settings.max_days_in_detail}
              onChange={handleChange}
              min="0"
              disabled={isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="max_days_in_photo">Max Days in Photo</Label>
            <Input
              id="max_days_in_photo"
              type="number"
              value={settings.max_days_in_photo}
              onChange={handleChange}
              min="0"
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
              "Save Goals"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
