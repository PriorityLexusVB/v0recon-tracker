"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Clock, Target, CheckCircle, AlertTriangle } from "lucide-react"

interface PerformanceOverviewProps {
  avgDaysInRecon: number
  onTimeCompletionRate: number
  totalAssignments: number
  completedOnTime: number
  overdueAssignments: number
}

export function TimelinePerformanceOverview({
  avgDaysInRecon,
  onTimeCompletionRate,
  totalAssignments,
  completedOnTime,
  overdueAssignments,
}: PerformanceOverviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Overall Performance</CardTitle>
        <CardDescription>Key metrics for the reconditioning timeline</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <Clock className="h-6 w-6 text-blue-500" />
            <div>
              <p className="text-sm text-muted-foreground">Avg. Days in Recon</p>
              <p className="text-xl font-bold">{avgDaysInRecon.toFixed(1)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Target className="h-6 w-6 text-purple-500" />
            <div>
              <p className="text-sm text-muted-foreground">On-Time Rate</p>
              <p className="text-xl font-bold">{onTimeCompletionRate.toFixed(1)}%</p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Completed On Time</span>
            <span className="font-medium">
              {completedOnTime} / {totalAssignments}
            </span>
          </div>
          <Progress value={totalAssignments > 0 ? (completedOnTime / totalAssignments) * 100 : 0} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>Completed: {completedOnTime}</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <span>Overdue: {overdueAssignments}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
