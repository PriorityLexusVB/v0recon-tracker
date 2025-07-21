"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Clock, Target, RefreshCw, Download, Loader2, AlertTriangle } from "lucide-react"
import { getTimelineMetrics, getDailyProgress } from "@/app/actions/timeline"
import { toast } from "sonner"

interface TimelineMetrics {
  avgDaysInRecon: number
  avgDaysPerStage: { stage: string; avgDays: number }[]
  onTimeCompletionRate: number
  totalAssignments: number
  completedOnTime: number
  overdueAssignments: number
}

interface DailyProgress {
  date: string
  completed: number
  inProgress: number
}

export function TimelineDashboard() {
  const [metrics, setMetrics] = useState<TimelineMetrics | null>(null)
  const [dailyProgress, setDailyProgress] = useState<DailyProgress[]>([])
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(true)
  const [isLoadingProgress, setIsLoadingProgress] = useState(true)
  const [dateRange, setDateRange] = useState("30d")

  useEffect(() => {
    fetchMetrics()
    fetchDailyProgress()
  }, [dateRange])

  const fetchMetrics = async () => {
    setIsLoadingMetrics(true)
    try {
      const data = await getTimelineMetrics(dateRange)
      setMetrics(data)
      toast.success("Timeline metrics refreshed!")
    } catch (error) {
      console.error("Failed to fetch timeline metrics:", error)
      toast.error("Failed to load timeline metrics.")
      setMetrics(null)
    } finally {
      setIsLoadingMetrics(false)
    }
  }

  const fetchDailyProgress = async () => {
    setIsLoadingProgress(true)
    try {
      const data = await getDailyProgress(dateRange)
      setDailyProgress(data)
      toast.success("Daily progress refreshed!")
    } catch (error) {
      console.error("Failed to fetch daily progress:", error)
      toast.error("Failed to load daily progress.")
      setDailyProgress([])
    } finally {
      setIsLoadingProgress(false)
    }
  }

  const exportReport = () => {
    if (!metrics || dailyProgress.length === 0) {
      toast.info("No data to export.")
      return
    }

    const csvData = [
      ["Metric", "Value"],
      ["Average Days in Recon", metrics.avgDaysInRecon.toFixed(1)],
      ["On-Time Completion Rate (%)", metrics.onTimeCompletionRate.toFixed(1)],
      ["Total Assignments", metrics.totalAssignments],
      ["Completed On Time", metrics.completedOnTime],
      ["Overdue Assignments", metrics.overdueAssignments],
      [],
      ["Stage", "Average Days"],
      ...metrics.avgDaysPerStage.map((s) => [s.stage, s.avgDays.toFixed(1)]),
      [],
      ["Date", "Completed", "In Progress"],
      ...dailyProgress.map((d) => [d.date, d.completed, d.inProgress]),
    ]

    const csvContent = csvData.map((row) => row.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `recon-timeline-report-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
    toast.info("Timeline report exported!")
  }

  if (isLoadingMetrics || isLoadingProgress) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <p className="ml-4 text-gray-600">Loading timeline data...</p>
      </div>
    )
  }

  if (!metrics) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-800">No Timeline Data Available</h3>
        <p className="text-gray-600 mt-2">
          Could not load timeline metrics. Please ensure your database is seeded and try again.
        </p>
        <Button
          onClick={() => {
            fetchMetrics()
            fetchDailyProgress()
          }}
          className="mt-4"
        >
          <RefreshCw className="h-4 w-4 mr-2" /> Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Recon Timeline Dashboard</h1>
          <p className="text-gray-600">Track vehicle flow and identify bottlenecks</p>
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
          <Button
            variant="outline"
            onClick={() => {
              fetchMetrics()
              fetchDailyProgress()
            }}
            disabled={isLoadingMetrics || isLoadingProgress}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingMetrics || isLoadingProgress ? "animate-spin" : ""}`} />
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
            <CardTitle className="text-sm font-medium">Avg. Days in Recon</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.avgDaysInRecon.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">Overall average</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On-Time Completion Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.onTimeCompletionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Assignments completed on schedule</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalAssignments}</div>
            <p className="text-xs text-muted-foreground">All assignments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Assignments</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{metrics.overdueAssignments}</div>
            <p className="text-xs text-muted-foreground">Requiring immediate attention</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="progress" className="space-y-6">
        <TabsList>
          <TabsTrigger value="progress">Daily Progress</TabsTrigger>
          <TabsTrigger value="stages">Stage Durations</TabsTrigger>
        </TabsList>

        <TabsContent value="progress" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Daily Vehicle Progress</CardTitle>
              <CardDescription>Completed and in-progress vehicles over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  completed: {
                    label: "Completed",
                    color: "hsl(var(--chart-1))",
                  },
                  inProgress: {
                    label: "In Progress",
                    color: "hsl(var(--chart-2))",
                  },
                }}
                className="h-[400px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyProgress}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="completed"
                      stroke="var(--color-completed)"
                      strokeWidth={2}
                      name="Completed"
                    />
                    <Line
                      type="monotone"
                      dataKey="inProgress"
                      stroke="var(--color-inProgress)"
                      strokeWidth={2}
                      name="In Progress"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stages" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Average Days Per Stage</CardTitle>
              <CardDescription>Time spent in each reconditioning stage</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  avgDays: {
                    label: "Average Days",
                    color: "hsl(var(--chart-1))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={metrics.avgDaysPerStage}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="stage" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="avgDays" fill="var(--color-avgDays)" name="Average Days" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
