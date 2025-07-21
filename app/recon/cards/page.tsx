"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Car, Clock, CheckCircle, RefreshCw, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { VehicleCard } from "@/components/vehicle-card"
import { VehicleFilters } from "@/components/vehicle-filters"
import { StatsCard } from "@/components/stats-summary"
import { CompletedVehiclesToggle } from "@/components/completed-vehicles-toggle"
import { CompletedVehiclesPanel } from "@/components/completed-vehicles-panel"

interface Vehicle {
  id: string
  vin: string
  make: string
  model: string
  year: number
  color?: string
  status: string
  priority: string
  createdAt: string
  updatedAt: string
}

export default function ReconCardsPage() {
  const { user, isLoading } = useAuth()
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([])
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(true)
  const [statusFilter, setStatusFilter] = useState("all")
  const [makeFilter, setMakeFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const [showCompleted, setShowCompleted] = useState(false)

  useEffect(() => {
    loadVehicles()
  }, [])

  useEffect(() => {
    filterAndSortVehicles()
  }, [vehicles, statusFilter, makeFilter, priorityFilter, sortBy])

  const loadVehicles = async () => {
    setIsLoadingVehicles(true)
    try {
      const response = await fetch("/api/google-sheets")
      const data = await response.json()

      if (data.success && data.vehicles) {
        const vehicleData: Vehicle[] = data.vehicles.map((item: any, index: number) => ({
          id: item.id || `vehicle_${index}`,
          vin: item.vin || "",
          make: item.make || "Unknown",
          model: item.model || "Unknown",
          year: item.year || new Date().getFullYear(),
          color: item.color,
          status: item.status || "pending",
          priority: item.priority || "low",
          createdAt: item.createdAt || new Date().toISOString(),
          updatedAt: item.updatedAt || new Date().toISOString(),
        }))

        setVehicles(vehicleData)
        toast.success(`🚗 Loaded ${vehicleData.length} vehicles from vAuto`)
      } else {
        // Fallback to mock data for demo
        const mockVehicles: Vehicle[] = [
          {
            id: "1",
            vin: "1HGBH41JXMN109186",
            make: "Honda",
            model: "Accord",
            year: 2022,
            color: "Red",
            status: "COMPLETED",
            priority: "HIGH",
            createdAt: "2024-01-15T10:00:00Z",
            updatedAt: "2024-01-15T10:00:00Z",
          },
          {
            id: "2",
            vin: "1FTFW1ET5DFC10312",
            make: "Ford",
            model: "F-150",
            year: 2021,
            color: "Blue",
            status: "PENDING",
            priority: "MEDIUM",
            createdAt: "2024-01-10T10:00:00Z",
            updatedAt: "2024-01-10T10:00:00Z",
          },
          {
            id: "3",
            vin: "2T1BURHE0JC123456",
            make: "Toyota",
            model: "Camry",
            year: 2023,
            color: "Black",
            status: "IN_PROGRESS",
            priority: "LOW",
            createdAt: "2024-01-12T10:00:00Z",
            updatedAt: "2024-01-12T10:00:00Z",
          },
        ]
        setVehicles(mockVehicles)
        toast.info("🚗 Using demo data - Connect your vAuto feed for live data")
      }
    } catch (error) {
      console.error("Error loading vehicles:", error)
      toast.error("❌ Failed to load vehicle data")
    } finally {
      setIsLoadingVehicles(false)
    }
  }

  const filterAndSortVehicles = () => {
    const filtered = vehicles.filter((vehicle) => {
      if (statusFilter !== "all" && vehicle.status !== statusFilter) return false
      if (makeFilter !== "all" && vehicle.make !== makeFilter) return false
      if (priorityFilter !== "all" && vehicle.priority !== priorityFilter) return false
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
          return priorityOrder[b.priority] - priorityOrder[a.priority]
        case "make":
          return a.make.localeCompare(b.make)
        case "year":
          return b.year - a.year
        default:
          return 0
      }
    })

    setFilteredVehicles(filtered)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800"
      case "PENDING":
        return "bg-gray-100 text-gray-800"
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "bg-red-100 text-red-800"
      case "MEDIUM":
        return "bg-orange-100 text-orange-800"
      case "LOW":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle className="h-4 w-4" />
      case "PENDING":
      case "IN_PROGRESS":
        return <Clock className="h-4 w-4" />
      default:
        return <Car className="h-4 w-4" />
    }
  }

  const getProgress = (vehicle: Vehicle): number => {
    let progress = 0
    if (vehicle.status === "COMPLETED") progress = 100
    if (vehicle.status === "IN_PROGRESS") progress = 50
    if (vehicle.status === "PENDING") progress = 25
    return progress
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  const uniqueMakes = Array.from(new Set(vehicles.map((v) => v.make))).sort()

  const stats = {
    total: vehicles.length,
    pending: vehicles.filter((v) => v.status === "PENDING").length,
    inProgress: vehicles.filter((v) => v.status === "IN_PROGRESS").length,
    completed: vehicles.filter((v) => v.status === "COMPLETED").length,
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Recon Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.name || user?.email}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={loadVehicles} disabled={isLoadingVehicles}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoadingVehicles ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <CompletedVehiclesToggle
            showCompleted={showCompleted}
            onToggle={setShowCompleted}
            completedCount={stats.completed}
          />
        </div>
      </div>

      {/* Stats Cards */}
      <StatsCard {...stats} />

      {/* Filters */}
      <VehicleFilters
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        makeFilter={makeFilter}
        onMakeFilterChange={setMakeFilter}
        priorityFilter={priorityFilter}
        onPriorityFilterChange={setPriorityFilter}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        vehicles={vehicles}
      />

      {/* Vehicle Cards */}
      {showCompleted ? (
        <CompletedVehiclesPanel
          vehicles={vehicles.filter((v) => v.status === "COMPLETED")}
          onClose={() => setShowCompleted(false)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVehicles.length > 0 ? (
            filteredVehicles.map((vehicle) => <VehicleCard key={vehicle.id} vehicle={vehicle} />)
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500">No vehicles found matching your filters.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
