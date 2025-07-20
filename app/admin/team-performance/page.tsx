"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { Users, Car, Clock, Award, Target, Download, RefreshCw, AlertTriangle } from "lucide-react"

interface TeamPerformance {
  id: string
  name: string
  department: string
  totalAssignments: number
  completedAssignments: number
  inProgressAssignments: number
  overdueAssignments: number
  averageCompletionTime: number
  completionRate: number
  members: number
  efficiency: number
  bottleneck: boolean
  weeklyTrend: { week: string; completed: number }[]
}

export default function TeamPerformancePage() {
  const { user, isLoading } = useAuth()
  const [teamPerformance, setTeamPerformance] = useState<TeamPerformance[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all")
  const [dateRange, setDateRange] = useState<string>("30d")

  useEffect(() => {
    loadTeamPerformance()
  }, [selectedDepartment, dateRange])

  const loadTeamPerformance = async () => {
    setIsLoadingData(true)

    // Mock data with realistic performance metrics
    const mockData: TeamPerformance[] = [
      {
        id: "team_shop_a",
        name: "Shop Team Alpha",
        department: "shop",
        totalAssignments: 45,
        completedAssignments: 38,
        inProgressAssignments: 5,
        overdueAssignments: 2,
        averageCompletionTime: 2.3,
        completionRate: 84.4,
        members: 6,
        efficiency: 92.5,
        bottleneck: false,
        weeklyTrend: [
          { week: "Week 1", completed: 8 },
          { week: "Week 2", completed: 12 },
          { week: "Week 3", completed: 10 },
          { week: "Week 4", completed: 8 },
        ],
      },
      {
        id: "team_shop_b",
        name: "Shop Team Beta",
        department: "shop",
        totalAssignments: 32,
        completedAssignments: 28,
        inProgressAssignments: 3,
        overdueAssignments: 1,
        averageCompletionTime: 2.1,
        completionRate: 87.5,
        members: 4,
        efficiency: 95.2,
        bottleneck: false,
        weeklyTrend: [
          { week: "Week 1", completed: 6 },
          { week: "Week 2", completed: 8 },
          { week: "Week 3", completed: 7 },
          { week: "Week 4", completed: 7 },
        ],
      },
      {
        id: "team_detail_1",
        name: "Detail Team One",
        department: "detail",
        totalAssignments: 52,
        completedAssignments: 47,
        inProgressAssignments: 4,
        overdueAssignments: 1,
        averageCompletionTime: 1.8,
        completionRate: 90.4,
        members: 5,
        efficiency: 88.7,
        bottleneck: true,
        weeklyTrend: [
          { week: "Week 1", completed: 11 },
          { week: "Week 2", completed: 13 },
          { week: "Week 3", completed: 12 },
          { week: "Week 4", completed: 11 },
        ],
      },
      {
        id: "team_photo_main",
        name: "Photo Team Main",
        department: "photo",
        totalAssignments: 38,
        completedAssignments: 35,
        inProgressAssignments: 2,
        overdueAssignments: 1,
        averageCompletionTime: 0.8,
        completionRate: 92.1,
        members: 3,
        efficiency: 96.8,
        bottleneck: false,
        weeklyTrend: [
          { week: "Week 1", completed: 9 },
          { week: "Week 2", completed: 10 },
          { week: "Week 3", completed: 8 },
          { week: "Week 4", completed: 8 },
        ],
      },
    ]

    // Filter by department if selected
    const filteredData =
      selectedDepartment === "all" ? mockData : mockData.filter((team) => team.department === selectedDepartment)

    setTeamPerformance(filteredData)
    setIsLoadingData(false)
  }

  const exportReport = () => {
    const csvData = [
      [
        "Team Name",
        "Department",
        "Total Assignments",
        "Completed",
        "In Progress",
        "Overdue",
        "Completion Rate",
        "Avg Time",
        "Efficiency",
      ],
      ...teamPerformance.map((team) => [
        team.name,
        team.department,
        team.totalAssignments,
        team.completedAssignments,
        team.inProgressAssignments,
        team.overdueAssignments,
        `${team.completionRate}%`,
        `${team.averageCompletionTime} days`,
        `${team.efficiency}%`,
      ]),
    ]

    const csvContent = csvData.map((row) => row.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `team-performance-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (isLoading) {
    return <div className="container mx-auto py-8">Loading...</div>
  }

  if (user?.role !== "ADMIN" && user?.role !== "MANAGER") {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-red-600">Access denied. Admin or Manager privileges required.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const chartData = teamPerformance.map((team) => ({
    name: team.name.split(" ").slice(0, 2).join(" "),
    completed: team.completedAssignments,
    inProgress: team.inProgressAssignments,
    overdue: team.overdueAssignments,
    completionRate: team.completionRate,
    efficiency: team.efficiency,
  }))

  const departmentData = teamPerformance.reduce((acc, team) => {
    const dept = acc.find((d) => d.department === team.department)
    if (dept) {
      dept.totalAssignments += team.totalAssignments
      dept.completedAssignments += team.completedAssignments
      dept.teams += 1
    } else {
      acc.push({
        department: team.department,
        totalAssignments: team.totalAssignments,
        completedAssignments: team.completedAssignments,
        teams: 1,
      })
    }
    return acc
  }, [] as any[])

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

  const totalAssignments = teamPerformance.reduce((sum, team) => sum + team.totalAssignments, 0)
  const totalCompleted = teamPerformance.reduce((sum, team) => sum + team.completedAssignments, 0)
  const avgCompletionRate =
    teamPerformance.length > 0
      ? teamPerformance.reduce((sum, team) => sum + team.completionRate, 0) / teamPerformance.length
      : 0
  const bestPerformer = teamPerformance.sort((a, b) => b.completionRate - a.completionRate)[0]

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Team Performance Dashboard</h1>
          <p className="text-gray-600">Monitor team productivity and performance metrics</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              <SelectItem value="shop">Shop</SelectItem>
              <SelectItem value="detail">Detail</SelectItem>
              <SelectItem value="photo">Photo</SelectItem>
            </SelectContent>
          </Select>

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

          <Button variant="outline" onClick={loadTeamPerformance} disabled={isLoadingData}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingData ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Button variant="outline" onClick={exportReport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Teams</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamPerformance.length}</div>
            <p className="text-xs text-muted-foreground">
              {teamPerformance.reduce((sum, team) => sum + team.members, 0)} total members
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAssignments}</div>
            <p className="text-xs text-muted-foreground">{totalCompleted} completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Completion Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(avgCompletionRate)}%</div>
            <p className="text-xs text-muted-foreground">Across all teams</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Performer</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bestPerformer?.name.split(" ")[0] || "N/A"}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round(bestPerformer?.completionRate || 0)}% completion
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="teams" className="space-y-6">
        <TabsList>
          <TabsTrigger value="teams">Team Performance</TabsTrigger>
          <TabsTrigger value="departments">Department Overview</TabsTrigger>
          <TabsTrigger value="trends">Performance Trends</TabsTrigger>
          <TabsTrigger value="bottlenecks">Bottleneck Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="teams" className="space-y-6">
          {/* Team Performance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {teamPerformance.map((team) => (
              <Card key={team.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{team.name}</CardTitle>
                    <div className="flex gap-2">
                      <Badge variant="outline">{team.department}</Badge>
                      {team.bottleneck && (
                        <Badge variant="destructive" className="flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Bottleneck
                        </Badge>
                      )}
                    </div>
                  </div>
                  <CardDescription>
                    {team.members} members • {team.efficiency}% efficiency
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Total Assignments</p>
                      <p className="text-2xl font-bold">{team.totalAssignments}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Completed</p>
                      <p className="text-2xl font-bold text-green-600">{team.completedAssignments}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">In Progress</p>
                      <p className="text-2xl font-bold text-blue-600">{team.inProgressAssignments}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Overdue</p>
                      <p className="text-2xl font-bold text-red-600">{team.overdueAssignments}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Completion Rate</span>
                      <span className="font-medium">{team.completionRate}%</span>
                    </div>
                    <Progress value={team.completionRate} className="h-2" />
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>Avg completion: {team.averageCompletionTime} days</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Performance Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Team Assignment Status</CardTitle>
              <CardDescription>Current status of assignments across all teams</CardDescription>
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
                  overdue: {
                    label: "Overdue",
                    color: "hsl(var(--chart-3))",
                  },
                }}
                className="h-[400px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="completed" fill="var(--color-completed)" name="Completed" />
                    <Bar dataKey="inProgress" fill="var(--color-inProgress)" name="In Progress" />
                    <Bar dataKey="overdue" fill="var(--color-overdue)" name="Overdue" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="departments" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Department Distribution</CardTitle>
                <CardDescription>Assignment distribution by department</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    assignments: {
                      label: "Assignments",
                      color: "hsl(var(--chart-1))",
                    },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={departmentData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ department, percent }) => `${department} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="totalAssignments"
                      >
                        {departmentData.map((entry, index) => (
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
                <CardTitle>Department Performance</CardTitle>
                <CardDescription>Completion rates by department</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {departmentData.map((dept) => (
                  <div key={dept.department} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="capitalize font-medium">{dept.department}</span>
                      <span>{Math.round((dept.completedAssignments / dept.totalAssignments) * 100)}%</span>
                    </div>
                    <Progress value={(dept.completedAssignments / dept.totalAssignments) * 100} className="h-2" />
                    <p className="text-xs text-gray-600">
                      {dept.completedAssignments}/{dept.totalAssignments} completed • {dept.teams} teams
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Performance Trends</CardTitle>
              <CardDescription>Team completion trends over the last 4 weeks</CardDescription>
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
                  <LineChart data={teamPerformance[0]?.weeklyTrend || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    {teamPerformance.map((team, index) => (
                      <Line
                        key={team.id}
                        type="monotone"
                        dataKey="completed"
                        data={team.weeklyTrend}
                        stroke={COLORS[index % COLORS.length]}
                        strokeWidth={2}
                        name={team.name}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bottlenecks" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  Identified Bottlenecks
                </CardTitle>
                <CardDescription>Teams requiring immediate attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {teamPerformance
                    .filter((team) => team.bottleneck)
                    .map((team) => (
                      <div key={team.id} className="p-4 border border-red-200 rounded-lg bg-red-50">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-red-800">{team.name}</h4>
                          <Badge variant="destructive">Bottleneck</Badge>
                        </div>
                        <p className="text-sm text-red-700 mb-2">
                          Efficiency: {team.efficiency}% • Avg Time: {team.averageCompletionTime} days
                        </p>
                        <p className="text-xs text-red-600">
                          {team.overdueAssignments} overdue assignments requiring immediate attention
                        </p>
                      </div>
                    ))}
                  {teamPerformance.filter((team) => team.bottleneck).length === 0 && (
                    <p className="text-center text-gray-500 py-8">No bottlenecks identified</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Efficiency Comparison</CardTitle>
                <CardDescription>Team efficiency scores</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    efficiency: {
                      label: "Efficiency",
                      color: "hsl(var(--chart-2))",
                    },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="efficiency" fill="var(--color-efficiency)" name="Efficiency %" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
