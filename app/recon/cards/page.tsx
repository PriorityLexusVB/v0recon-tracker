"use client"

import { useState, useEffect } from "react"
import { VehicleGrid } from "@/components/vehicle-grid"
import { VehicleFilters } from "@/components/vehicle-filters"
import { Statsummary } from "@/components/stats-summary"
import { CompletedVehiclesToggle } from "@/components/completed-vehicles-toggle"
import { CompletedVehiclesPanel } from "@/components/completed-vehicles-panel"

interface Vehicle {
  id: string
  vin: string
  make: string
  model: string
  year: number
  color: string | null
  status: string
  priority: string
  location: string | null
  notes: string | null
  createdAt: Date
  updatedAt: Date
  completedAt: Date | null
}

export default function ReconCardsPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("all")
  const [makeFilter, setMakeFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const [showCompleted, setShowCompleted] = useState(false)

  useEffect(() => {
    fetchVehicles()
  }, [])

  const fetchVehicles = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/v1/vehicles")
      if (response.ok) {
        const data = await response.json()
        setVehicles(data)
      } else {
        console.error("Failed to fetch vehicles")
      }
    } catch (error) {
      console.error("Error fetching vehicles:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortVehicles = (vehicles: Vehicle[]) => {
    const filtered = vehicles.filter((vehicle) => {
      // Status filter
      if (statusFilter !== "all" && vehicle.status !== statusFilter) {
        return false
      }

      // Make filter
      if (makeFilter !== "all" && vehicle.make !== makeFilter) {
        return false
      }

      // Priority filter
      if (priorityFilter !== "all" && vehicle.priority !== priorityFilter) {
        return false
      }

      return true
    })

    // Sort vehicles
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case "priority":
          const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 }
          return (
            priorityOrder[b.priority as keyof typeof priorityOrder] -
            priorityOrder[a.priority as keyof typeof priorityOrder]
          )
        case "make":
          return a.make.localeCompare(b.make)
        case "year":
          return b.year - a.year
        default:
          return 0
      }
    })

    return filtered
  }

  const filteredVehicles = filterAndSortVehicles(vehicles)
  const completedVehicles = vehicles.filter((v) => v.status === "COMPLETED")
  const activeVehicles = vehicles.filter((v) => v.status !== "COMPLETED")

  const stats = {
    total: vehicles.length,
    pending: vehicles.filter((v) => v.status === "PENDING").length,
    inProgress: vehicles.filter((v) => v.status === "IN_PROGRESS").length,
    completed: completedVehicles.length,
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading vehicles...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Vehicle Recon Cards</h1>
        <CompletedVehiclesToggle
          showCompleted={showCompleted}
          onToggle={setShowCompleted}
          completedCount={completedVehicles.length}
        />
      </div>

      <Statsummary stats={stats} />

      {!showCompleted ? (
        <>
          <VehicleFilters
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            makeFilter={makeFilter}
            onMakeFilterChange={setMakeFilter}
            priorityFilter={priorityFilter}
            onPriorityFilterChange={setPriorityFilter}
            sortBy={sortBy}
            onSortByChange={setSortBy}
            vehicles={activeVehicles}
          />

          <VehicleGrid
            vehicles={filteredVehicles.filter((v) => v.status !== "COMPLETED")}
            onVehicleUpdate={fetchVehicles}
          />
        </>
      ) : (
        <CompletedVehiclesPanel vehicles={completedVehicles} onVehicleUpdate={fetchVehicles} />
      )}
    </div>
  )
}
