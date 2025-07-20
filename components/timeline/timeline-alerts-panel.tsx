"use client"

import { useState } from "react"
import { useTimelineStore } from "@/lib/timeline-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AlertTriangle, Clock, CheckCircle, X, Eye, Trash2, Settings, Target } from "lucide-react"
import { formatDate } from "@/lib/utils"

interface TimelineAlertsPanelProps {
  onViewVehicle?: (vin: string) => void
  onOpenSettings?: () => void
}

export default function TimelineAlertsPanel({ onViewVehicle, onOpenSettings }: TimelineAlertsPanelProps) {
  const { alerts, acknowledgeAlert, dismissAlert, clearAllAlerts } = useTimelineStore()
  const [showAll, setShowAll] = useState(false)

  const unacknowledgedAlerts = alerts.filter((alert) => !alert.acknowledged)
  const acknowledgedAlerts = alerts.filter((alert) => alert.acknowledged)
  const displayAlerts = showAll ? alerts : unacknowledgedAlerts

  const getAlertIcon = (type: string, step: string) => {
    if (type === "overdue") return <AlertTriangle className="h-4 w-4 text-red-600" />
    return <Clock className="h-4 w-4 text-yellow-600" />
  }

  const getAlertColor = (type: string, acknowledged: boolean) => {
    if (acknowledged) return "border-gray-200 bg-gray-50"
    if (type === "overdue") return "border-red-200 bg-red-50"
    return "border-yellow-200 bg-yellow-50"
  }

  const getStepBadge = (step: string) => {
    const colors = {
      shop: "bg-blue-100 text-blue-800",
      detail: "bg-green-100 text-green-800",
      photo: "bg-purple-100 text-purple-800",
      total: "bg-gray-100 text-gray-800",
    }

    return (
      <Badge className={colors[step as keyof typeof colors] || colors.total}>
        {step.charAt(0).toUpperCase() + step.slice(1)}
      </Badge>
    )
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffHours < 1) return "Just now"
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return formatDate(timestamp)
  }

  if (alerts.length === 0) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="text-center">
            <Target className="mx-auto h-8 w-8 text-green-600 mb-2" />
            <h3 className="text-lg font-semibold text-green-800">All Goals Met! 🎯</h3>
            <p className="text-sm text-green-700">No timeline alerts at this time</p>
            {onOpenSettings && (
              <Button variant="outline" size="sm" onClick={onOpenSettings} className="mt-3 bg-white">
                <Settings className="h-4 w-4 mr-2" />
                Adjust Goals
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <AlertTriangle className="h-5 w-5" />
            Timeline Alerts
            {unacknowledgedAlerts.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unacknowledgedAlerts.length}
              </Badge>
            )}
          </CardTitle>

          <div className="flex items-center gap-2">
            {onOpenSettings && (
              <Button variant="ghost" size="sm" onClick={onOpenSettings}>
                <Settings className="h-4 w-4" />
              </Button>
            )}
            {alerts.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearAllAlerts} className="text-red-600 hover:text-red-700">
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <Button variant="ghost" size="sm" onClick={() => setShowAll(false)} className={!showAll ? "bg-white" : ""}>
            Active ({unacknowledgedAlerts.length})
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setShowAll(true)} className={showAll ? "bg-white" : ""}>
            All ({alerts.length})
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-3">
            {displayAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border-2 ${getAlertColor(alert.type, alert.acknowledged)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      {getAlertIcon(alert.type, alert.step)}
                      <h4 className="font-semibold text-sm truncate">{alert.vehicleInfo}</h4>
                      {getStepBadge(alert.step)}
                      {alert.type === "overdue" && <Badge variant="destructive">Overdue</Badge>}
                      {alert.acknowledged && (
                        <Badge variant="secondary">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Acknowledged
                        </Badge>
                      )}
                    </div>

                    <p className="text-sm text-gray-700 mb-2">{alert.message}</p>

                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Current: {alert.currentDays} days</span>
                      <span>Target: {alert.targetDays} days</span>
                      <span>{formatTimestamp(alert.timestamp)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 ml-3">
                    {onViewVehicle && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewVehicle(alert.vehicleVin)}
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}

                    {!alert.acknowledged && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => acknowledgeAlert(alert.id)}
                        className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => dismissAlert(alert.id)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {displayAlerts.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Clock className="mx-auto h-8 w-8 mb-2 opacity-50" />
            <p className="text-sm">{showAll ? "No alerts found" : "No active alerts"}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
