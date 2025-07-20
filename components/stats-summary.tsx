"use client"

import { useVehicleStore } from "@/lib/store"
import { Car, CheckCircle, AlertTriangle } from "lucide-react"

export default function StatsSummary() {
  const { stats, setFilters, filters } = useVehicleStore()

  const handleStatClick = (statType: "total" | "completed" | "overdue") => {
    setFilters({
      activeStatFilter: filters.activeStatFilter === statType ? undefined : statType,
      status: "all",
    })
  }

  const getOverdueColor = (count: number) => {
    if (count > 3) return "text-red-600 bg-red-50 border-red-200"
    if (count >= 1) return "text-yellow-600 bg-yellow-50 border-yellow-200"
    return "text-green-600 bg-green-50 border-green-200"
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* Total Vehicles */}
      <div
        className={`bg-white p-6 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
          filters.activeStatFilter === "total" ? "border-blue-500 bg-blue-50" : "border-gray-200"
        }`}
        onClick={() => handleStatClick("total")}
      >
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Car className="h-8 w-8 text-blue-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Total Vehicles</p>
            <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
          </div>
        </div>
      </div>

      {/* Completed */}
      <div
        className={`bg-white p-6 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
          filters.activeStatFilter === "completed" ? "border-green-500 bg-green-50" : "border-gray-200"
        }`}
        onClick={() => handleStatClick("completed")}
      >
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Completed</p>
            <p className="text-2xl font-semibold text-gray-900">{stats.completed}</p>
            <p className="text-xs text-gray-400">
              {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}% complete
            </p>
          </div>
        </div>
      </div>

      {/* Overdue */}
      <div
        className={`p-6 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
          filters.activeStatFilter === "overdue"
            ? "border-red-500 bg-red-50"
            : `border-gray-200 bg-white ${getOverdueColor(stats.overdue)}`
        }`}
        onClick={() => handleStatClick("overdue")}
      >
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Overdue</p>
            <p className="text-2xl font-semibold text-gray-900">{stats.overdue}</p>
            <div className="text-xs text-gray-500 mt-1">
              <span>Shop: {stats.overdueShop}</span>
              <span className="mx-1">•</span>
              <span>Detail: {stats.overdueDetail}</span>
              <span className="mx-1">•</span>
              <span>Photo: {stats.overduePhoto}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
