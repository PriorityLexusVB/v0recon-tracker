"use client"

import { useEffect } from "react"
import { useAnalyticsStore } from "@/lib/analytics-store"
import { useVehicleStore } from "@/lib/vehicle-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  Download,
  Users,
  Target,
} from "lucide-react"
import PerformanceChart from "./performance-chart"
import TrendChart from "./trend-chart"
import DepartmentMetrics from "./department-metrics"

export default function AnalyticsDashboard() {
  const { getAllVehicles } = useVehicleStore()
  const { analytics, loading, reportFilters, generateAnalytics, setReportFilters, exportReport, lastUpdated } =
    useAnalyticsStore()

  useEffect(() => {
    // Get all vehicles (active + completed) for analytics
    const allVehicles = getAllVehicles()
    if (allVehicles.length > 0) {
      generateAnalytics(allVehicles)
    }
  }, [getAllVehicles, generateAnalytics])

  const handleExport = (format: "csv" | "pdf") => {
    exportReport(format)
  }

  if (loading || !analytics) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics & Reports</h2>
          <p className="text-gray-600">Performance insights and trends for vehicle reconditioning</p>
          {lastUpdated && (
            <p className="text-xs text-gray-500 mt-1">Last updated: {new Date(lastUpdated).toLocaleString()}</p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Select
            value={reportFilters.dateRange}
            onValueChange={(value: "7d" | "30d" | "90d" | "1y") => setReportFilters({ dateRange: value })}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={() => handleExport("csv")} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vehicles</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalVehicles}</div>
            <p className="text-xs text-muted-foreground">All time processed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.completionRate}%</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {analytics.completionRate >= 80 ? (
                <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
              )}
              {analytics.completedVehicles} of {analytics.totalVehicles} completed
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Completion Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.averageCompletionTime}</div>
            <p className="text-xs text-muted-foreground">days per vehicle</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Vehicles</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{analytics.overdueVehicles}</div>
            <p className="text-xs text-muted-foreground">Require immediate attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Daily Completions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PerformanceChart data={analytics.dailyCompletions} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Monthly Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TrendChart data={analytics.monthlyTrends} />
          </CardContent>
        </Card>
      </div>

      {/* Department Performance */}
      <DepartmentMetrics analytics={analytics} />

      {/* Top Performers & Issues */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Fastest Completions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.topPerformers.fastestCompletion.slice(0, 5).map((vehicle, index) => (
                <div key={vehicle.vin} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </p>
                    <p className="text-xs text-gray-500">Stock: {vehicle.stock}</p>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    #{index + 1}
                  </Badge>
                </div>
              ))}
              {analytics.topPerformers.fastestCompletion.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">No completed vehicles yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Most Overdue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.topPerformers.mostOverdue.slice(0, 5).map((vehicle, index) => (
                <div key={vehicle.vin} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </p>
                    <p className="text-xs text-gray-500">Stock: {vehicle.stock}</p>
                  </div>
                  <Badge variant="destructive">Overdue</Badge>
                </div>
              ))}
              {analytics.topPerformers.mostOverdue.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">No overdue vehicles</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
