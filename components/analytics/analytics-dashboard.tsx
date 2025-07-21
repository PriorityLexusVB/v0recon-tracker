"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Loader2, RefreshCw, Download, Car, Clock, TrendingUp, AlertTriangle, Target } from "lucide-react"
import { toast } from "sonner"
import { getAnalyticsData } from "@/app/actions/analytics" // Assuming this action exists or will be created

interface AnalyticsData {
  totalVehicles: number
  completedVehicles: number
  inProgressVehicles: number
  overdueVehicles: number
  avgCompletionTime: number
  completionRate: number
  statusBreakdown: { name: string; value: number; color: string }[]
  dailyCompletions: { date: string; completed: number }[]
  departmentPerformance: { department: string; completed: number; total: number }[]
}

export function AnalyticsDashboard() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [dateRange, setDateRange] = useState("30d") // This is still mock for now

  useEffect(() => {
    loadAnalyticsData()
  }, [dateRange])

  const loadAnalyticsData = async () => {
    setIsLoading(true)
    try {
      const data = await getAnalyticsData(dateRange) // Pass dateRange to action
      setAnalyticsData(data)
      toast.success("Analytics data loaded.")
    } catch (error) {
      console.error("Error loading analytics data:", error)
      toast.error("Failed to load analytics data.")
      setAnalyticsData(null) // Clear data on error
    } finally {
      setIsLoading(false)
    }
  }

  const exportReport = () => {
    if (!analyticsData) {
      toast.info("No data to export.")
      return
    }

    const csvData = [
      ["Metric", "Value"],
      ["Total Vehicles", analyticsData.totalVehicles],
      ["Completed Vehicles", analyticsData.completedVehicles],
      ["In Progress Vehicles", analyticsData.inProgressVehicles],
      ["Overdue Vehicles", analyticsData.overdueVehicles],
      ["Average Completion Time (Days)", analyticsData.avgCompletionTime],
      ["Completion Rate (%)", analyticsData.completionRate],
      [], // Empty row for separation
      ["Status Breakdown"],
      ["Status", "Count"],
      ...analyticsData.statusBreakdown.map((s) => [s.name, s.value]),
      [],
      ["Daily Completions"],
      ["Date", "Completed"],
      ...analyticsData.dailyCompletions.map((d) => [d.date, d.completed]),
      [],
      ["Department Performance"],
      ["Department", "Completed", "Total"],
      ...analyticsData.departmentPerformance.map((dp) => [dp.department, dp.completed, dp.total]),
    ]

    const csvContent = csvData.map((row) => row.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `recon-analytics-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <p className="ml-2 text-gray-600">Loading analytics...</p>
      </div>
    )
  }

  if (!analyticsData) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-lg font-semibold text-red-700">Error loading data</p>
        <p className="text-gray-600">Please try refreshing or check your data source configuration.</p>
        <Button onClick={loadAnalyticsData} className="mt-4">
          <RefreshCw className="h-4 w-4 mr-2" /> Retry
        </Button>
      </div>
    )
  }

  const pieChartData = analyticsData.statusBreakdown.map((item) => ({
    name: item.name,
    value: item.value,
    fill: item.color,
  }))

  const lineChartConfig = analyticsData.statusBreakdown.reduce((acc, item) => {
    acc[item.name.toLowerCase().replace(/\s/g, "")] = {
      label: item.name,
      color: item.color,
    }
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Recon Analytics</h1>
          <p className="text-gray-600">Comprehensive insights into your reconditioning process</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={loadAnalyticsData} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={exportReport}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vehicles</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalVehicles}</div>
            <p className="text-xs text-muted-foreground">Currently in system</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Vehicles</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.completedVehicles}</div>
            <p className="text-xs text-muted-foreground">In selected period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Completion Time</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.avgCompletionTime.toFixed(1)} days</div>
            <p className="text-xs text-muted-foreground">Average time to sales ready</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.completionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Of all vehicles</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="status">Status Breakdown</TabsTrigger>
          <TabsTrigger value="trends">Completion Trends</TabsTrigger>
          <TabsTrigger value="departments">Department Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Current Status Distribution</CardTitle>
                <CardDescription>Breakdown of vehicles by their current reconditioning status</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={lineChartConfig} // Using lineChartConfig for colors
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieChartData} cx="50%" cy="50%" labelLine={false} outerRadius={80} dataKey="value">
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
                <div className="grid grid-cols-2 gap-2 text-sm mt-4">
                  {analyticsData.statusBreakdown.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span>
                        {item.name}: {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Daily Completions</CardTitle>
                <CardDescription>Number of vehicles completed each day</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    completed: {
                      label: "Completed",
                      color: "hsl(var(--chart-1))",
                    },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analyticsData.dailyCompletions}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line type="monotone" dataKey="completed" stroke="var(--color-completed)" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="status" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Vehicle Status Overview</CardTitle>
              <CardDescription>Detailed breakdown of vehicles by their current status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {analyticsData.statusBreakdown.map((item) => (
                  <Card key={item.name} className="p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">{item.name}</h3>
                      <span className="text-2xl font-bold" style={{ color: item.color }}>
                        {item.value}
                      </span>
                    </div>
                    {/* Placeholder for Progress component */}
                    <div className="mt-2 h-2 bg-gray-200 rounded-full">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${(item.value / analyticsData.totalVehicles) * 100}%` }}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {((item.value / analyticsData.totalVehicles) * 100).toFixed(1)}% of total
                    </p>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Daily Completion Trend</CardTitle>
              <CardDescription>Visualizing the number of vehicles completed over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  completed: {
                    label: "Completed",
                    color: "hsl(var(--chart-1))",
                  },
                }}
                className="h-[400px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analyticsData.dailyCompletions}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="completed" stroke="var(--color-completed)" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="departments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Department Performance</CardTitle>
              <CardDescription>Completion rates and total assignments by department</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  completed: {
                    label: "Completed",
                    color: "hsl(var(--chart-1))",
                  },
                  total: {
                    label: "Total",
                    color: "hsl(var(--chart-2))",
                  },
                }}
                className="h-[400px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData.departmentPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="department" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="completed" fill="var(--color-completed)" name="Completed" />
                    <Bar dataKey="total" fill="var(--color-total)" name="Total" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {analyticsData.departmentPerformance.map((dept) => (
                  <Card key={dept.department} className="p-4">
                    <h3 className="text-lg font-semibold capitalize">{dept.department}</h3>
                    <p className="text-sm text-muted-foreground">
                      Completed: {dept.completed} / {dept.total}
                    </p>
                    {/* Placeholder for Progress component */}
                    <div className="mt-2 h-2 bg-gray-200 rounded-full">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${(dept.completed / dept.total) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Completion Rate: {((dept.completed / dept.total) * 100).toFixed(1)}%
                    </p>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
