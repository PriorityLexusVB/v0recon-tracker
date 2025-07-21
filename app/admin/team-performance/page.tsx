"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Users, Clock, CheckCircle } from "lucide-react"
import { fetchTeams } from "@/app/actions/teams"
import type { Team } from "@/lib/types" // Assuming you have a Team type
import { fetchTeamPerformance } from "@/app/actions/analytics" // Assuming this action exists
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, LineChart, Line } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface TeamPerformanceData {
  teamId: string
  teamName: string
  totalVehiclesProcessed: number
  avgReconTime: number // in days
  completionRate: number // percentage
  vehiclesByStatus: { status: string; count: number }[]
  monthlyPerformance: { month: string; vehiclesCompleted: number; avgTime: number }[]
}

export default function TeamPerformancePage() {
  const [teams, setTeams] = useState<Team[]>([])
  const [selectedTeamId, setSelectedTeamId] = useState<string | undefined>(undefined)
  const [performanceData, setPerformanceData] = useState<TeamPerformanceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadTeams = async () => {
      try {
        const { teams } = await fetchTeams("", 1, 100) // Fetch all teams
        setTeams(teams)
        if (teams.length > 0 && !selectedTeamId) {
          setSelectedTeamId(teams[0].id) // Select the first team by default
        }
      } catch (err) {
        setError("Failed to load teams.")
        console.error("Error loading teams:", err)
      }
    }
    loadTeams()
  }, [])

  useEffect(() => {
    const loadPerformanceData = async () => {
      if (!selectedTeamId) return

      setLoading(true)
      setError(null)
      try {
        const data = await fetchTeamPerformance(selectedTeamId)
        setPerformanceData(data)
      } catch (err) {
        setError("Failed to load team performance data.")
        console.error("Error loading team performance:", err)
        setPerformanceData(null)
      } finally {
        setLoading(false)
      }
    }
    loadPerformanceData()
  }, [selectedTeamId])

  if (loading && !performanceData) {
    return (
      <div className="container mx-auto py-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-2">Loading team performance...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 text-center text-red-600">
        <p>{error}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Team Performance</h1>
          <p className="text-gray-600">Analyze reconditioning performance by team</p>
        </div>
        <div className="w-64">
          <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a team" />
            </SelectTrigger>
            <SelectContent>
              {teams.map((team) => (
                <SelectItem key={team.id} value={team.id}>
                  {team.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="ml-2">
            Loading data for {teams.find((t) => t.id === selectedTeamId)?.name || "selected team"}...
          </p>
        </div>
      ) : performanceData ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Vehicles Processed</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{performanceData.totalVehiclesProcessed}</div>
                <p className="text-xs text-muted-foreground">Vehicles handled by this team</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Recon Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{performanceData.avgReconTime.toFixed(1)} days</div>
                <p className="text-xs text-muted-foreground">Average time to complete reconditioning</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{performanceData.completionRate.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">Percentage of vehicles completed</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Vehicles by Status</CardTitle>
                <CardDescription>Current status distribution for {performanceData.teamName}</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    count: { label: "Count", color: "hsl(var(--primary))" },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={performanceData.vehiclesByStatus}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="status" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Bar dataKey="count" fill="var(--color-count)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Performance Trend</CardTitle>
                <CardDescription>Vehicles completed and average time over the last 6 months</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    vehiclesCompleted: { label: "Vehicles Completed", color: "hsl(var(--chart-1))" },
                    avgTime: { label: "Avg. Time (Days)", color: "hsl(var(--chart-2))" },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={performanceData.monthlyPerformance}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis yAxisId="left" orientation="left" stroke="var(--color-vehiclesCompleted)" />
                      <YAxis yAxisId="right" orientation="right" stroke="var(--color-avgTime)" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="vehiclesCompleted"
                        stroke="var(--color-vehiclesCompleted)"
                        name="Vehicles Completed"
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="avgTime"
                        stroke="var(--color-avgTime)"
                        name="Avg. Time (Days)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <div className="text-center text-gray-500">No performance data available for the selected team.</div>
      )}
    </div>
  )
}
