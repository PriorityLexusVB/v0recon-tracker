"use client"
import { Loader2 } from "lucide-react"
import { fetchTeams } from "@/app/actions/analytics" // Assuming fetchTeams is also in analytics actions
import { Suspense } from "react"
import { TeamPerformanceDashboard } from "@/components/analytics/team-performance-dashboard"

interface TeamPerformanceData {
  teamId: string
  teamName: string
  totalVehiclesProcessed: number
  avgReconTime: number // in days
  completionRate: number // percentage
  vehiclesByStatus: { status: string; count: number }[]
  monthlyPerformance: { month: string; vehiclesCompleted: number; avgTime: number }[]
}

export const dynamic = "force-dynamic"

export default async function TeamPerformancePage({
  searchParams,
}: {
  searchParams: { teamId?: string }
}) {
  const selectedTeamId = searchParams.teamId

  const { teams, success: teamsSuccess, message: teamsMessage } = await fetchTeams("", 1, 100) // Fetch all teams for the dropdown

  if (!teamsSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] p-4">
        <h2 className="text-2xl font-bold text-red-600">Error Loading Teams</h2>
        <p className="text-gray-600 mt-2">{teamsMessage}</p>
      </div>
    )
  }

  const initialTeam = selectedTeamId ? teams.find((t) => t.id === selectedTeamId) : teams[0]

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-2">Loading team performance...</p>
        </div>
      }
    >
      <div className="flex flex-col gap-6 p-6">
        <h1 className="text-3xl font-bold">Team Performance</h1>
        <TeamPerformanceDashboard initialTeams={teams} initialSelectedTeamId={initialTeam?.id} />
      </div>
    </Suspense>
  )
}
