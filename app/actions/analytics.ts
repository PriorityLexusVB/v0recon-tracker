"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import type { OverallAnalytics, DepartmentMetrics, PerformanceTrend, TeamPerformanceData } from "@/lib/types"
import { addDays, startOfMonth, endOfMonth, format, subMonths } from "date-fns"
import { now as getCurrentTime } from "lodash"

export async function fetchOverallAnalytics(): Promise<{
  success: boolean
  data?: OverallAnalytics
  message?: string
}> {
  try {
    const totalVehicles = await prisma.vehicle.count()
    const vehiclesInProgress = await prisma.vehicle.count({
      where: { status: "IN_PROGRESS" },
    })

    const thirtyDaysAgo = addDays(getCurrentTime(), -30)
    const vehiclesCompletedLast30Days = await prisma.vehicle.count({
      where: {
        status: "COMPLETED",
        lastUpdated: {
          gte: thirtyDaysAgo,
        },
      },
    })

    const completedVehicles = await prisma.vehicle.findMany({
      where: { status: "COMPLETED" },
      select: { daysInRecon: true, reconditioningCost: true },
    })

    const totalReconCost = completedVehicles.reduce((sum, v) => sum + (v.reconditioningCost || 0), 0)
    const avgReconTime =
      completedVehicles.length > 0
        ? completedVehicles.reduce((sum, v) => sum + v.daysInRecon, 0) / completedVehicles.length
        : 0

    revalidatePath("/analytics")
    return {
      success: true,
      data: {
        totalVehicles,
        vehiclesInProgress,
        vehiclesCompletedLast30Days,
        avgReconTime: Number.parseFloat(avgReconTime.toFixed(1)),
        totalReconCost: Number.parseFloat(totalReconCost.toFixed(2)),
      },
    }
  } catch (error) {
    console.error("Failed to fetch overall analytics:", error)
    return { success: false, message: "Failed to fetch overall analytics." }
  }
}

export async function fetchDepartmentMetrics(): Promise<{
  success: boolean
  data?: DepartmentMetrics[]
  message?: string
}> {
  try {
    const departments = await prisma.timelineEvent.groupBy({
      by: ["department"],
      _count: {
        id: true,
      },
      _avg: {
        // This is a simplified average time. A more complex calculation would involve
        // tracking entry/exit timestamps for each department.
        // For now, we'll just count events per department.
        // You might need to adjust your schema or add more complex logic for true time-in-department.
      },
      where: {
        department: { not: null },
      },
    })

    const metrics: DepartmentMetrics[] = await Promise.all(
      departments.map(async (dept) => {
        const vehiclesInDept = await prisma.vehicle.count({
          where: { currentLocation: dept.department },
        })

        const completedInDept = await prisma.timelineEvent.count({
          where: {
            department: dept.department,
            eventType: "COMPLETED", // Assuming 'COMPLETED' event marks completion in a department
          },
        })

        // Placeholder for avgTimeInDepartment - requires more complex logic
        const avgTimeInDepartment = 0 // Implement actual calculation if schema supports it

        return {
          department: dept.department!,
          vehiclesCount: vehiclesInDept,
          avgTimeInDepartment: Number.parseFloat(avgTimeInDepartment.toFixed(1)),
          completedCount: completedInDept,
        }
      }),
    )

    revalidatePath("/analytics")
    return { success: true, data: metrics }
  } catch (error) {
    console.error("Failed to fetch department metrics:", error)
    return { success: false, message: "Failed to fetch department metrics." }
  }
}

export async function fetchPerformanceTrend(
  timeframe: "daily" | "weekly" | "monthly" = "monthly",
): Promise<{ success: boolean; data?: PerformanceTrend[]; message?: string }> {
  try {
    const now = getCurrentTime()
    let startDate: Date

    switch (timeframe) {
      case "daily":
        startDate = addDays(now, -30) // Last 30 days
        break
      case "weekly":
        startDate = addDays(now, -7 * 12) // Last 12 weeks
        break
      case "monthly":
      default:
        startDate = subMonths(now, 6) // Last 6 months
        break
    }

    const completedVehicles = await prisma.vehicle.findMany({
      where: {
        status: "COMPLETED",
        lastUpdated: {
          gte: startDate,
        },
      },
      select: {
        lastUpdated: true,
        daysInRecon: true,
      },
      orderBy: {
        lastUpdated: "asc",
      },
    })

    const trendMap = new Map<string, { vehiclesCompleted: number; totalDaysInRecon: number; count: number }>()

    completedVehicles.forEach((vehicle) => {
      let periodKey: string
      if (timeframe === "daily") {
        periodKey = format(vehicle.lastUpdated, "yyyy-MM-dd")
      } else if (timeframe === "weekly") {
        periodKey = `Week ${format(vehicle.lastUpdated, "w, yyyy")}`
      } else {
        // monthly
        periodKey = format(vehicle.lastUpdated, "MMM yyyy")
      }

      const current = trendMap.get(periodKey) || { vehiclesCompleted: 0, totalDaysInRecon: 0, count: 0 }
      current.vehiclesCompleted += 1
      current.totalDaysInRecon += vehicle.daysInRecon
      current.count += 1
      trendMap.set(periodKey, current)
    })

    const trendData: PerformanceTrend[] = Array.from(trendMap.entries())
      .map(([period, data]) => ({
        period,
        vehiclesCompleted: data.vehiclesCompleted,
        avgReconTime: data.count > 0 ? Number.parseFloat((data.totalDaysInRecon / data.count).toFixed(1)) : 0,
      }))
      .sort((a, b) => {
        // Simple sorting for monthly/daily. For weekly, might need more robust parsing.
        if (timeframe === "monthly") {
          return new Date(a.period).getTime() - new Date(b.period).getTime()
        }
        return a.period.localeCompare(b.period)
      })

    revalidatePath("/analytics")
    return { success: true, data: trendData }
  } catch (error) {
    console.error("Failed to fetch performance trend:", error)
    return { success: false, message: "Failed to fetch performance trend." }
  }
}

export async function fetchTeamPerformance(
  teamId: string,
): Promise<{ success: boolean; data?: TeamPerformanceData; message?: string }> {
  try {
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      select: { id: true, name: true, members: { select: { id: true } } },
    })

    if (!team) {
      return { success: false, message: "Team not found." }
    }

    const memberIds = team.members.map((m) => m.id)

    const totalVehiclesProcessed = await prisma.vehicle.count({
      where: { assignedToId: { in: memberIds } },
    })

    const completedVehicles = await prisma.vehicle.findMany({
      where: {
        assignedToId: { in: memberIds },
        status: "COMPLETED",
      },
      select: { daysInRecon: true },
    })

    const avgReconTime =
      completedVehicles.length > 0
        ? completedVehicles.reduce((sum, v) => sum + v.daysInRecon, 0) / completedVehicles.length
        : 0

    const completionRate = totalVehiclesProcessed > 0 ? (completedVehicles.length / totalVehiclesProcessed) * 100 : 0

    const vehiclesByStatus = await prisma.vehicle.groupBy({
      by: ["status"],
      _count: {
        id: true,
      },
      where: { assignedToId: { in: memberIds } },
    })

    const vehiclesByStatusFormatted = vehiclesByStatus.map((item) => ({
      status: item.status,
      count: item._count.id,
    }))

    // Monthly performance for the last 6 months
    const monthlyPerformance: { month: string; vehiclesCompleted: number; avgTime: number }[] = []
    for (let i = 5; i >= 0; i--) {
      const monthStart = startOfMonth(subMonths(now(), i))
      const monthEnd = endOfMonth(subMonths(now(), i))
      const monthName = format(monthStart, "MMM yyyy")

      const monthlyCompletedVehicles = await prisma.vehicle.findMany({
        where: {
          assignedToId: { in: memberIds },
          status: "COMPLETED",
          lastUpdated: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
        select: { daysInRecon: true },
      })

      const monthlyAvgTime =
        monthlyCompletedVehicles.length > 0
          ? monthlyCompletedVehicles.reduce((sum, v) => sum + v.daysInRecon, 0) / monthlyCompletedVehicles.length
          : 0

      monthlyPerformance.push({
        month: monthName,
        vehiclesCompleted: monthlyCompletedVehicles.length,
        avgTime: Number.parseFloat(monthlyAvgTime.toFixed(1)),
      })
    }

    revalidatePath("/admin/team-performance")
    return {
      success: true,
      data: {
        teamId: team.id,
        teamName: team.name,
        totalVehiclesProcessed,
        avgReconTime: Number.parseFloat(avgReconTime.toFixed(1)),
        completionRate: Number.parseFloat(completionRate.toFixed(1)),
        vehiclesByStatus: vehiclesByStatusFormatted,
        monthlyPerformance,
      },
    }
  } catch (error) {
    console.error("Failed to fetch team performance:", error)
    return { success: false, message: "Failed to fetch team performance." }
  }
}
