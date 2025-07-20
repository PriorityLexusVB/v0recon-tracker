"use client"

import { useTimelineStore } from "@/lib/timeline-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Target, TrendingUp, TrendingDown, Clock, CheckCircle, AlertTriangle } from "lucide-react"

export default function TimelinePerformanceOverview() {
  const { goals, performance } = useTimelineStore()

  const totalVehicles = performance.onTrack + performance.atRisk + performance.overdue
  const onTrackPercentage = totalVehicles > 0 ? Math.round((performance.onTrack / totalVehicles) * 100) : 0
  const atRiskPercentage = totalVehicles > 0 ? Math.round((performance.atRisk / totalVehicles) * 100) : 0
  const overduePercentage = totalVehicles > 0 ? Math.round((performance.overdue / totalVehicles) * 100) : 0

  const getGoalPercentage = (met: number, total: number) => {
    return total > 0 ? Math.round((met / total) * 100) : 0
  }

  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600"
    if (percentage >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getPerformanceIcon = (percentage: number) => {
    if (percentage >= 80) return <TrendingUp className="h-4 w-4 text-green-600" />
    if (percentage >= 60) return <Clock className="h-4 w-4 text-yellow-600" />
    return <TrendingDown className="h-4 w-4 text-red-600" />
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Overall Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Overall Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="flex items-center justify-center gap-1 mb-1">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">On Track</span>
              </div>
              <p className="text-2xl font-bold text-green-600">{performance.onTrack}</p>
              <p className="text-xs text-gray-500">{onTrackPercentage}%</p>
            </div>

            <div>
              <div className="flex items-center justify-center gap-1 mb-1">
                <Clock className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium">At Risk</span>
              </div>
              <p className="text-2xl font-bold text-yellow-600">{performance.atRisk}</p>
              <p className="text-xs text-gray-500">{atRiskPercentage}%</p>
            </div>

            <div>
              <div className="flex items-center justify-center gap-1 mb-1">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium">Overdue</span>
              </div>
              <p className="text-2xl font-bold text-red-600">{performance.overdue}</p>
              <p className="text-xs text-gray-500">{overduePercentage}%</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Goal Achievement</span>
              <span className={getPerformanceColor(onTrackPercentage)}>{onTrackPercentage}%</span>
            </div>
            <Progress value={onTrackPercentage} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Step-by-Step Goals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Goal Achievement by Step
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { name: "Shop", key: "shop", target: goals.shopTarget },
            { name: "Detail", key: "detail", target: goals.detailTarget },
            { name: "Photo", key: "photo", target: goals.photoTarget },
            { name: "Total", key: "total", target: goals.totalTarget },
          ].map((step) => {
            const stepKey = step.key as keyof typeof performance.goalsMet
            const met = performance.goalsMet[stepKey]
            const total = performance.goalsTotal[stepKey]
            const percentage = getGoalPercentage(met, total)

            return (
              <div key={step.key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{step.name}</span>
                    <Badge variant="outline" className="text-xs">
                      ≤{step.target}d
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    {getPerformanceIcon(percentage)}
                    <span className={`font-semibold ${getPerformanceColor(percentage)}`}>
                      {met}/{total} ({percentage}%)
                    </span>
                  </div>
                </div>
                <Progress value={percentage} className="h-2" />
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}
