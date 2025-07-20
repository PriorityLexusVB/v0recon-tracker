"use client"

import { useState } from "react"
import { useTimelineStore } from "@/lib/timeline-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Settings, Target, RotateCcw, Save, Bell } from "lucide-react"
import NotificationSettingsModal from "@/components/notifications/notification-settings-modal"

export default function TimelineGoalsSettings() {
  const { goals, updateGoals, resetGoalsToDefaults } = useTimelineStore()
  const [localGoals, setLocalGoals] = useState(goals)
  const [showNotificationSettings, setShowNotificationSettings] = useState(false)

  const handleSave = () => {
    updateGoals(localGoals)
  }

  const handleReset = () => {
    resetGoalsToDefaults()
    setLocalGoals(useTimelineStore.getState().goals)
  }

  const updateGoal = (step: keyof typeof localGoals, field: "target" | "warning", value: number) => {
    setLocalGoals({
      ...localGoals,
      [step]: {
        ...localGoals[step],
        [field]: value,
      },
    })
  }

  const hasChanges = JSON.stringify(localGoals) !== JSON.stringify(goals)

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Timeline Goals & Alerts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Notification Settings Button */}
          <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div>
              <h3 className="font-semibold text-blue-900">Notification Settings</h3>
              <p className="text-sm text-blue-700">Configure email, SMS, and webhook alerts for timeline issues</p>
            </div>
            <Button onClick={() => setShowNotificationSettings(true)} className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Configure Alerts
            </Button>
          </div>

          {/* Goals Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Step Targets (Days)
            </h3>

            <div className="grid gap-4">
              {Object.entries(localGoals).map(([step, config]) => (
                <div key={step} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium capitalize flex items-center gap-2">
                      {step === "shop" && "🔧"}
                      {step === "detail" && "✨"}
                      {step === "photo" && "📸"}
                      {step === "total" && "📊"}
                      {step.charAt(0).toUpperCase() + step.slice(1)}
                      {step === "total" && <Badge variant="secondary">Overall</Badge>}
                    </h4>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`${step}-target`} className="text-sm font-medium">
                        Target Days
                      </Label>
                      <Input
                        id={`${step}-target`}
                        type="number"
                        min="1"
                        max="30"
                        value={config.target}
                        onChange={(e) => updateGoal(step as keyof typeof localGoals, "target", Number(e.target.value))}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`${step}-warning`} className="text-sm font-medium">
                        Warning Threshold (%)
                      </Label>
                      <Input
                        id={`${step}-warning`}
                        type="number"
                        min="50"
                        max="100"
                        value={config.warning}
                        onChange={(e) => updateGoal(step as keyof typeof localGoals, "warning", Number(e.target.value))}
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                    Warning at {Math.round((config.target * config.warning) / 100)} days • Target: {config.target} days
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Goal Achievement Metrics */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">How Goals Work</h3>
            <div className="grid gap-3 text-sm">
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="w-3 h-3 bg-green-500 rounded-full mt-1 flex-shrink-0"></div>
                <div>
                  <strong className="text-green-800">On Track</strong>
                  <p className="text-green-700">Vehicle is progressing within the warning threshold</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mt-1 flex-shrink-0"></div>
                <div>
                  <strong className="text-yellow-800">At Risk</strong>
                  <p className="text-yellow-700">Vehicle has exceeded the warning threshold but not the target</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                <div className="w-3 h-3 bg-red-500 rounded-full mt-1 flex-shrink-0"></div>
                <div>
                  <strong className="text-red-800">Overdue</strong>
                  <p className="text-red-700">
                    Vehicle has exceeded the target timeline and requires immediate attention
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button variant="outline" onClick={handleReset} className="flex items-center gap-2 bg-transparent">
              <RotateCcw className="h-4 w-4" />
              Reset to Defaults
            </Button>
            <Button onClick={handleSave} disabled={!hasChanges} className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              {hasChanges ? "Save Changes" : "No Changes"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings Modal */}
      {showNotificationSettings && <NotificationSettingsModal onClose={() => setShowNotificationSettings(false)} />}
    </>
  )
}
