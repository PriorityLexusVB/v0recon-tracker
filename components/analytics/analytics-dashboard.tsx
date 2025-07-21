"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Car, Clock, CheckCircle, AlertTriangle, TrendingUp, Download, RefreshCw, Loader2 } from "lucide-react"
import { getAnalyticsData } from "@/app/actions/analytics"
import { toast } from "sonner"

interface AnalyticsData {
  totalVehicles: number
  completedVehicles: number
  inProgressVehicles: number
  overdueVehicles: number
  avgCompletionTime: number
  completionRate: number
  statusBreakdown: { name: string; value: number }[]
  dailyCompletions: { date: string; completed: number }[]
  departmentPerformance: { department: string; completed: number; total: number }[]
}

export function AnalyticsDashboard() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [dateRange, setDateRange] = useState("30d")

  useEffect(() => {
    fetchAnalyticsData()
  }, [dateRange])

  const fetchAnalyticsData = async () => {
    setIsLoading(true)
    try {
      const data = await getAnalyticsData(dateRange)
      setAnalyticsData(data)
      toast.success("Analytics data refreshed!")
    } catch (error) {
      console.error("Failed to fetch analytics data:", error)
      toast.error("Failed to load analytics data.")
      setAnalyticsData(null) // Clear data on error
    } finally {
      setIsLoading(false)
    }
  }

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <p className="ml-4 text-gray-600">Loading analytics...</p>
      </div>
    )
  }

  if (!analyticsData) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-800">No Analytics Data Available</h3>
        <p className="text-gray-600 mt-2">
          Could not load analytics. Please ensure your database is seeded and try again.
        </p>
        <Button onClick={fetchAnalyticsData} className="mt-4">
          <RefreshCw className="h-4 w-4 mr-2" /> Retry
        </Button>
      </div>
    )
  }

  const {
    totalVehicles,
    completedVehicles,
    inProgressVehicles,
    overdueVehicles,
    avgCompletionTime,
    completionRate,
    statusBreakdown,
    dailyCompletions,
    departmentPerformance,
  } = analyticsData

  const exportReport = () => {
    const csvData = [
      ["Metric", "Value"],
      ["Total Vehicles", totalVehicles],
      ["Completed Vehicles", completedVehicles],
      ["In Progress Vehicles", inProgressVehicles],
      ["Overdue Vehicles", overdueVehicles],
      ["Average Completion Time (Days)", avgCompletionTime.toFixed(2)],
      ["Completion Rate (%)", completionRate.toFixed(2)],
      [], // Empty row for separation
      ["Status", "Count"],
      ...statusBreakdown.map((s) => [s.name, s.value]),
      [],
      ["Date", "Completed Vehicles"],
      ...dailyCompletions.map((d) => [d.date, d.completed]),
      [],
      ["Department", "Completed", "Total"],
      ...departmentPerformance.map((d) => [d.department, d.completed, d.total]),
    ]

    const csvContent = csvData.map((row) => row.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `recon-analytics-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
    toast.info("Analytics report exported!")
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Recon Analytics</h1>
          <p className="text-gray-600">Overview of vehicle reconditioning performance</p>
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
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={fetchAnalyticsData} disabled={isLoading}>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vehicles</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVehicles}</div>
            <p className="text-xs text-muted-foreground">Currently in system</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed This Period</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedVehicles}</div>
            <p className="text-xs text-muted-foreground">Vehicles finished</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Completion Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgCompletionTime.toFixed(1)} days</div>
            <p className="text-xs text-muted-foreground">From inventory to sales ready</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Of all vehicles</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Vehicle Status Breakdown</CardTitle>
                <CardDescription>Current status of all vehicles in the system</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    value: {
                      label: "Vehicles",
                      color: "hsl(var(--chart-1))",
                    },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusBreakdown}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {statusBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Key Metrics</CardTitle>
                <CardDescription>Snapshot of critical performance indicators</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Car className="h-5 w-5 text-blue-600" />
                    <span className="font-medium">In Progress</span>
                  </div>
                  <span className="text-xl font-bold text-blue-700">{inProgressVehicles}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <span className="font-medium">Overdue</span>
                  </div>
                  <span className="text-xl font-bold text-red-700">{overdueVehicles}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium">Completed</span>
                  </div>
                  <span className="text-xl font-bold text-green-700">{completedVehicles}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Daily Completion Trend</CardTitle>
              <CardDescription>Number of vehicles completed per day</CardDescription>
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
                  <LineChart data={dailyCompletions}>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Department Performance</CardTitle>
                <CardDescription>Completion rates by department</CardDescription>
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
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={departmentPerformance}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="department" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="completed" fill="var(--color-completed)" name="Completed" />
                      <Bar dataKey="total" fill="var(--color-total)" name="Total" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Department Efficiency</CardTitle>
                <CardDescription>Comparison of department workload and output</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {departmentPerformance.map((dept) => (
                  <div key={dept.department} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="capitalize font-medium">{dept.department}</span>
                      <span>{dept.total > 0 ? `${((dept.completed / dept.total) * 100).toFixed(1)}%` : "0%"}</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${dept.total > 0 ? (dept.completed / dept.total) * 100 : 0}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-600">
                      {dept.completed} of {dept.total} assignments completed
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
