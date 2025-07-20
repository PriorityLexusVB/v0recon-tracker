"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AlertTriangle, CheckCircle, Clock } from "lucide-react"
import type { AnalyticsData } from "@/lib/analytics-store"

interface DepartmentMetricsProps {
  analytics: AnalyticsData
}

export default function DepartmentMetrics({ analytics }: DepartmentMetricsProps) {
  const departments = [
    {
      name: "Shop",
      data: analytics.stepPerformance.shop,
      metrics: analytics.departmentMetrics.shop,
      color: "blue",
    },
    {
      name: "Detail",
      data: analytics.stepPerformance.detail,
      metrics: analytics.departmentMetrics.detail,
      color: "green",
    },
    {
      name: "Photo",
      data: analytics.stepPerformance.photo,
      metrics: analytics.departmentMetrics.photo,
      color: "purple",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Department Performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {departments.map((dept) => (
            <div key={dept.name} className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">{dept.name}</h3>
                {dept.metrics.bottleneck ? (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Bottleneck
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    On Track
                  </Badge>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Completed</span>
                    <span>{dept.data.completed}</span>
                  </div>
                  <Progress value={(dept.data.completed / analytics.totalVehicles) * 100} className="h-2" />
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Avg. Time</p>
                    <p className="font-semibold">{dept.metrics.efficiency} days</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Overdue</p>
                    <p className={`font-semibold ${dept.data.overdue > 0 ? "text-red-600" : "text-green-600"}`}>
                      {dept.data.overdue}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Efficiency Score</span>
                    <span
                      className={`font-medium ${
                        dept.metrics.efficiency <= 3
                          ? "text-green-600"
                          : dept.metrics.efficiency <= 5
                            ? "text-yellow-600"
                            : "text-red-600"
                      }`}
                    >
                      {dept.metrics.efficiency <= 3
                        ? "Excellent"
                        : dept.metrics.efficiency <= 5
                          ? "Good"
                          : "Needs Improvement"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
