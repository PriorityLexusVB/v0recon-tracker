import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Vehicle } from "./types"
import { daysSince, isOverdue } from "./utils"

export interface AnalyticsData {
  totalVehicles: number
  completedVehicles: number
  averageCompletionTime: number
  overdueVehicles: number
  completionRate: number
  dailyCompletions: { date: string; count: number }[]
  stepPerformance: {
    shop: { completed: number; average: number; overdue: number }
    detail: { completed: number; average: number; overdue: number }
    photo: { completed: number; average: number; overdue: number }
  }
  monthlyTrends: {
    month: string
    completed: number
    started: number
    overdue: number
  }[]
  departmentMetrics: {
    shop: { efficiency: number; bottleneck: boolean }
    detail: { efficiency: number; bottleneck: boolean }
    photo: { efficiency: number; bottleneck: boolean }
  }
  topPerformers: {
    fastestCompletion: Vehicle[]
    mostOverdue: Vehicle[]
  }
}

export interface ReportFilters {
  dateRange: "7d" | "30d" | "90d" | "1y"
  department: "all" | "shop" | "detail" | "photo"
  status: "all" | "completed" | "in-progress" | "overdue"
}

interface AnalyticsStore {
  analytics: AnalyticsData | null
  reportFilters: ReportFilters
  loading: boolean
  lastUpdated: string | null

  // Actions
  generateAnalytics: (vehicles: Vehicle[]) => void
  setReportFilters: (filters: Partial<ReportFilters>) => void
  setLoading: (loading: boolean) => void
  exportReport: (format: "csv" | "pdf") => void
}

const calculateAverageCompletionTime = (vehicles: Vehicle[]): number => {
  const completedVehicles = vehicles.filter((v) => v.throughShop && v.detailComplete && v.photoComplete)

  if (completedVehicles.length === 0) return 0

  const totalDays = completedVehicles.reduce((sum, vehicle) => {
    const inventoryDate = new Date(vehicle.inventoryDate)
    const completionDate = new Date(
      Math.max(
        new Date(vehicle.shopDone || 0).getTime(),
        new Date(vehicle.detailDone || 0).getTime(),
        new Date(vehicle.photoDone || 0).getTime(),
      ),
    )

    const diffTime = completionDate.getTime() - inventoryDate.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return sum + diffDays
  }, 0)

  return Math.round(totalDays / completedVehicles.length)
}

const generateDailyCompletions = (vehicles: Vehicle[], days: number) => {
  const dailyData: { date: string; count: number }[] = []

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dateString = date.toISOString().split("T")[0]

    const completedOnDate = vehicles.filter((vehicle) => {
      const shopDone = vehicle.shopDone === dateString && vehicle.throughShop
      const detailDone = vehicle.detailDone === dateString && vehicle.detailComplete
      const photoDone = vehicle.photoDone === dateString && vehicle.photoComplete
      return shopDone || detailDone || photoDone
    }).length

    dailyData.push({
      date: dateString,
      count: completedOnDate,
    })
  }

  return dailyData
}

const generateMonthlyTrends = (vehicles: Vehicle[]) => {
  const months = []
  const now = new Date()

  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthString = date.toLocaleDateString("en-US", { month: "short", year: "numeric" })

    const monthVehicles = vehicles.filter((vehicle) => {
      const inventoryDate = new Date(vehicle.inventoryDate)
      return inventoryDate.getMonth() === date.getMonth() && inventoryDate.getFullYear() === date.getFullYear()
    })

    const completed = monthVehicles.filter((v) => v.throughShop && v.detailComplete && v.photoComplete).length
    const overdue = monthVehicles.filter(
      (v) =>
        isOverdue(v.shopDone, v.throughShop) ||
        isOverdue(v.detailDone, v.detailComplete) ||
        isOverdue(v.photoDone, v.photoComplete),
    ).length

    months.push({
      month: monthString,
      completed,
      started: monthVehicles.length,
      overdue,
    })
  }

  return months
}

export const useAnalyticsStore = create<AnalyticsStore>()(
  persist(
    (set, get) => ({
      analytics: null,
      reportFilters: {
        dateRange: "30d",
        department: "all",
        status: "all",
      },
      loading: false,
      lastUpdated: null,

      generateAnalytics: (allVehicles) => {
        set({ loading: true })

        // Use all vehicles (active + completed) for analytics
        const totalVehicles = allVehicles.length
        const completedVehicles = allVehicles.filter((v) => v.throughShop && v.detailComplete && v.photoComplete).length
        const overdueVehicles = allVehicles.filter(
          (v) =>
            isOverdue(v.shopDone, v.throughShop) ||
            isOverdue(v.detailDone, v.detailComplete) ||
            isOverdue(v.photoDone, v.photoComplete),
        ).length

        const completionRate = totalVehicles > 0 ? (completedVehicles / totalVehicles) * 100 : 0
        const averageCompletionTime = calculateAverageCompletionTime(allVehicles)

        // Step performance analysis
        const shopCompleted = allVehicles.filter((v) => v.throughShop).length
        const detailCompleted = allVehicles.filter((v) => v.detailComplete).length
        const photoCompleted = allVehicles.filter((v) => v.photoComplete).length

        const shopOverdue = allVehicles.filter((v) => isOverdue(v.shopDone, v.throughShop)).length
        const detailOverdue = allVehicles.filter((v) => isOverdue(v.detailDone, v.detailComplete)).length
        const photoOverdue = allVehicles.filter((v) => isOverdue(v.photoDone, v.photoComplete)).length

        // Calculate average days for each step
        const shopAverage =
          allVehicles.reduce((sum, v) => {
            if (v.shopDone && v.throughShop) {
              return sum + daysSince(v.inventoryDate, v.shopDone)
            }
            return sum
          }, 0) / Math.max(shopCompleted, 1)

        const detailAverage =
          allVehicles.reduce((sum, v) => {
            if (v.detailDone && v.detailComplete) {
              const shopDone = v.shopDone || v.inventoryDate
              return sum + daysSince(shopDone, v.detailDone)
            }
            return sum
          }, 0) / Math.max(detailCompleted, 1)

        const photoAverage =
          allVehicles.reduce((sum, v) => {
            if (v.photoDone && v.photoComplete) {
              const detailDone = v.detailDone || v.shopDone || v.inventoryDate
              return sum + daysSince(detailDone, v.photoDone)
            }
            return sum
          }, 0) / Math.max(photoCompleted, 1)

        // Department efficiency (lower is better)
        const shopEfficiency = shopCompleted > 0 ? Math.round(shopAverage * 10) / 10 : 0
        const detailEfficiency = detailCompleted > 0 ? Math.round(detailAverage * 10) / 10 : 0
        const photoEfficiency = photoCompleted > 0 ? Math.round(photoAverage * 10) / 10 : 0

        // Identify bottlenecks (steps taking longer than average)
        const overallAverage = (shopEfficiency + detailEfficiency + photoEfficiency) / 3

        // Top performers
        const completedVehiclesList = allVehicles.filter((v) => v.throughShop && v.detailComplete && v.photoComplete)
        const fastestCompletion = completedVehiclesList
          .sort((a, b) => {
            const aTime = calculateAverageCompletionTime([a])
            const bTime = calculateAverageCompletionTime([b])
            return aTime - bTime
          })
          .slice(0, 5)

        const mostOverdue = allVehicles
          .filter(
            (v) =>
              isOverdue(v.shopDone, v.throughShop) ||
              isOverdue(v.detailDone, v.detailComplete) ||
              isOverdue(v.photoDone, v.photoComplete),
          )
          .sort((a, b) => {
            const aOverdue = Math.max(daysSince(a.shopDone), daysSince(a.detailDone), daysSince(a.photoDone))
            const bOverdue = Math.max(daysSince(b.shopDone), daysSince(b.detailDone), daysSince(b.photoDone))
            return bOverdue - aOverdue
          })
          .slice(0, 5)

        const analytics: AnalyticsData = {
          totalVehicles,
          completedVehicles,
          averageCompletionTime,
          overdueVehicles,
          completionRate: Math.round(completionRate * 10) / 10,
          dailyCompletions: generateDailyCompletions(allVehicles, 30),
          stepPerformance: {
            shop: { completed: shopCompleted, average: shopEfficiency, overdue: shopOverdue },
            detail: { completed: detailCompleted, average: detailEfficiency, overdue: detailOverdue },
            photo: { completed: photoCompleted, average: photoEfficiency, overdue: photoOverdue },
          },
          monthlyTrends: generateMonthlyTrends(allVehicles),
          departmentMetrics: {
            shop: { efficiency: shopEfficiency, bottleneck: shopEfficiency > overallAverage * 1.2 },
            detail: { efficiency: detailEfficiency, bottleneck: detailEfficiency > overallAverage * 1.2 },
            photo: { efficiency: photoEfficiency, bottleneck: photoEfficiency > overallAverage * 1.2 },
          },
          topPerformers: {
            fastestCompletion,
            mostOverdue,
          },
        }

        set({
          analytics,
          loading: false,
          lastUpdated: new Date().toISOString(),
        })
      },

      setReportFilters: (filters) => {
        set((state) => ({
          reportFilters: { ...state.reportFilters, ...filters },
        }))
      },

      setLoading: (loading) => set({ loading }),

      exportReport: (format) => {
        const { analytics } = get()
        if (!analytics) return

        if (format === "csv") {
          // Generate CSV data
          const csvData = [
            ["Metric", "Value"],
            ["Total Vehicles", analytics.totalVehicles.toString()],
            ["Completed Vehicles", analytics.completedVehicles.toString()],
            ["Completion Rate", `${analytics.completionRate}%`],
            ["Average Completion Time", `${analytics.averageCompletionTime} days`],
            ["Overdue Vehicles", analytics.overdueVehicles.toString()],
            ["Shop Efficiency", `${analytics.departmentMetrics.shop.efficiency} days`],
            ["Detail Efficiency", `${analytics.departmentMetrics.detail.efficiency} days`],
            ["Photo Efficiency", `${analytics.departmentMetrics.photo.efficiency} days`],
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
      },
    }),
    {
      name: "analytics-store",
      partialize: (state) => ({
        analytics: state.analytics,
        reportFilters: state.reportFilters,
        lastUpdated: state.lastUpdated,
      }),
    },
  ),
)
