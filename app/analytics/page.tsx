"use client"

import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, TrendingUp, Clock, Users, Car } from "lucide-react"
import { OverallAnalyticsCard } from "@/components/analytics/overall-analytics-card"
import { DepartmentMetricsTable } from "@/components/analytics/department-metrics"
import { PerformanceTrendChart } from "@/components/analytics/performance-chart"
import { fetchOverallAnalytics, fetchDepartmentMetrics, fetchPerformanceTrend } from "@/app/actions/analytics"
import { Suspense } from "react"
import { Loader2 } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function AnalyticsPage() {
  const { user, isLoading } = useAuth()

  const [overallAnalyticsResult, departmentMetricsResult, performanceTrendResult] = await Promise.all([
    fetchOverallAnalytics(),
    fetchDepartmentMetrics(),
    fetchPerformanceTrend("monthly"), // Default to monthly trend
  ])

  if (
    isLoading ||
    !overallAnalyticsResult.success ||
    !departmentMetricsResult.success ||
    !performanceTrendResult.success
  ) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] p-4">
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-2">Loading analytics...</p>
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-bold text-red-600">Error Loading Analytics</h2>
            <p className="text-gray-600 mt-2">
              {overallAnalyticsResult.message ||
                departmentMetricsResult.message ||
                performanceTrendResult.message ||
                "An unknown error occurred."}
            </p>
          </div>
        )}
      </div>
    )
  }

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-2">Loading analytics...</p>
        </div>
      }
    >
      <div className="container mx-auto py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
            <p className="text-gray-600">Track performance and insights</p>
          </div>
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-6 w-6 text-blue-600" />
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Completion Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4.2 days</div>
              <p className="text-xs text-muted-foreground">-0.5 from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Throughput</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">28</div>
              <p className="text-xs text-muted-foreground">vehicles this week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Teams</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">across all departments</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Efficiency Rate</CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">94.2%</div>
              <p className="text-xs text-muted-foreground">+2.1% from last month</p>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="departments">Departments</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <OverallAnalyticsCard data={overallAnalyticsResult.data!} />
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <PerformanceTrendChart initialData={performanceTrendResult.data!} />
          </TabsContent>

          <TabsContent value="departments" className="space-y-4">
            <DepartmentMetricsTable data={departmentMetricsResult.data!} />
          </TabsContent>

          <TabsContent value="trends" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Trend Analysis</CardTitle>
                <CardDescription>Long-term performance trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] flex items-center justify-center text-gray-500">
                  Chart placeholder - Trend analysis
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Suspense>
  )
}
