"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { AlertTriangle, Clock, CheckCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface TimelineAlertsPanelProps {
  overdueCount: number
  upcomingCount: number
  completedTodayCount: number
}

export function TimelineAlertsPanel({ overdueCount, upcomingCount, completedTodayCount }: TimelineAlertsPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          Recon Alerts
        </CardTitle>
        <CardDescription>Key metrics for immediate attention</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex flex-col items-center justify-center p-4 border rounded-lg bg-red-50">
          <AlertTriangle className="h-8 w-8 text-red-600 mb-2" />
          <p className="text-2xl font-bold text-red-700">{overdueCount}</p>
          <p className="text-sm text-red-600">Overdue</p>
          <Badge variant="destructive" className="mt-2">
            Action Required
          </Badge>
        </div>
        <div className="flex flex-col items-center justify-center p-4 border rounded-lg bg-yellow-50">
          <Clock className="h-8 w-8 text-yellow-600 mb-2" />
          <p className="text-2xl font-bold text-yellow-700">{upcomingCount}</p>
          <p className="text-sm text-yellow-600">Upcoming</p>
          <Badge variant="secondary" className="mt-2">
            Plan Ahead
          </Badge>
        </div>
        <div className="flex flex-col items-center justify-center p-4 border rounded-lg bg-green-50">
          <CheckCircle className="h-8 w-8 text-green-600 mb-2" />
          <p className="text-2xl font-bold text-green-700">{completedTodayCount}</p>
          <p className="text-sm text-green-600">Completed Today</p>
          <Badge className="bg-green-200 text-green-800 mt-2">Great Job!</Badge>
        </div>
      </CardContent>
    </Card>
  )
}
