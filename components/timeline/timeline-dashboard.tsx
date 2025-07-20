"use client"

import { useState, useMemo, useEffect } from "react"
import { useVehicleStore } from "@/lib/vehicle-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Clock, AlertTriangle, Search, Calendar, BarChart3, Eye, Target } from "lucide-react"
import { daysSince, formatDate } from "@/lib/utils"
import VehicleTimeline from "./vehicle-timeline"
import type { Vehicle } from "@/lib/types"
// Add the new imports at the top
import TimelineGoalsSettings from "./timeline-goals-settings"
import TimelineAlertsPanel from "./timeline-alerts-panel"
import TimelinePerformanceOverview from "./timeline-performance-overview"
import { useTimelineStore } from "@/lib/timeline-store"

interface TimelineStats {
  averageShopTime: number
  averageDetailTime: number
  averagePhotoTime: number
  averageTotalTime: number
  bottleneckStep: string
  fastestVehicle: Vehicle | null
  slowestVehicle: Vehicle | null
}

export default function TimelineDashboard() {
  const { getAllVehicles } = useVehicleStore()
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<"total" | "shop" | "detail" | "photo">("total")
  const [filterBy, setFilterBy] = useState<"all" | "completed" | "in-progress" | "bottleneck">("all")
  // Add state for settings modal after the existing useState declarations
  const [showGoalsSettings, setShowGoalsSettings] = useState(false)

  const allVehicles = getAllVehicles()

  // Calculate timeline statistics
  const stats: TimelineStats = useMemo(() => {
    const completedVehicles = allVehicles.filter((v) => v.throughShop && v.detailComplete && v.photoComplete)

    if (completedVehicles.length === 0) {
      return {
        averageShopTime: 0,
        averageDetailTime: 0,
        averagePhotoTime: 0,
        averageTotalTime: 0,
        bottleneckStep: "None",
        fastestVehicle: null,
        slowestVehicle: null,
      }
    }

    const shopTimes = completedVehicles.map((v) => daysSince(v.inventoryDate, v.shopDone))
    const detailTimes = completedVehicles.map((v) => daysSince(v.shopDone || v.inventoryDate, v.detailDone))
    const photoTimes = completedVehicles.map((v) =>
      daysSince(v.detailDone || v.shopDone || v.inventoryDate, v.photoDone),
    )
    const totalTimes = completedVehicles.map((v) => daysSince(v.inventoryDate, v.photoDone))

    const averageShopTime = shopTimes.reduce((a, b) => a + b, 0) / shopTimes.length
    const averageDetailTime = detailTimes.reduce((a, b) => a + b, 0) / detailTimes.length
    const averagePhotoTime = photoTimes.reduce((a, b) => a + b, 0) / photoTimes.length
    const averageTotalTime = totalTimes.reduce((a, b) => a + b, 0) / totalTimes.length

    // Determine bottleneck step
    const stepAverages = {
      shop: averageShopTime,
      detail: averageDetailTime,
      photo: averagePhotoTime,
    }
    const bottleneckStep = Object.entries(stepAverages).reduce((a, b) =>
      stepAverages[a[0] as keyof typeof stepAverages] > stepAverages[b[0] as keyof typeof stepAverages] ? a : b,
    )[0]

    // Find fastest and slowest vehicles
    const vehiclesWithTotalTime = completedVehicles.map((v) => ({
      vehicle: v,
      totalTime: daysSince(v.inventoryDate, v.photoDone),
    }))

    const fastestVehicle = vehiclesWithTotalTime.reduce((a, b) => (a.totalTime < b.totalTime ? a : b)).vehicle
    const slowestVehicle = vehiclesWithTotalTime.reduce((a, b) => (a.totalTime > b.totalTime ? a : b)).vehicle

    return {
      averageShopTime: Math.round(averageShopTime * 10) / 10,
      averageDetailTime: Math.round(averageDetailTime * 10) / 10,
      averagePhotoTime: Math.round(averagePhotoTime * 10) / 10,
      averageTotalTime: Math.round(averageTotalTime * 10) / 10,
      bottleneckStep: bottleneckStep.charAt(0).toUpperCase() + bottleneckStep.slice(1),
      fastestVehicle,
      slowestVehicle,
    }
  }, [allVehicles])

  // Add timeline store hook after the existing hooks
  const { checkTimelineAlerts, calculatePerformance } = useTimelineStore()

  // Add this useEffect after the existing useMemo for stats
  useEffect(() => {
    if (allVehicles.length > 0) {
      checkTimelineAlerts(allVehicles)
      calculatePerformance(allVehicles)
    }
  }, [allVehicles, checkTimelineAlerts, calculatePerformance])

  // Filter and sort vehicles
  const filteredVehicles = useMemo(() => {
    let filtered = allVehicles

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (v) =>
          v.vin.toLowerCase().includes(searchLower) ||
          v.stock.toLowerCase().includes(searchLower) ||
          v.make.toLowerCase().includes(searchLower) ||
          v.model.toLowerCase().includes(searchLower),
      )
    }

    // Apply status filter
    if (filterBy !== "all") {
      filtered = filtered.filter((v) => {
        const isCompleted = v.throughShop && v.detailComplete && v.photoComplete
        const hasBottleneck =
          (!v.throughShop && daysSince(v.inventoryDate) > 7) ||
          (v.throughShop && !v.detailComplete && daysSince(v.shopDone || v.inventoryDate) > 5) ||
          (v.detailComplete && !v.photoComplete && daysSince(v.detailDone || v.inventoryDate) > 3)

        switch (filterBy) {
          case "completed":
            return isCompleted
          case "in-progress":
            return !isCompleted
          case "bottleneck":
            return hasBottleneck
          default:
            return true
        }
      })
    }

    // Sort vehicles
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "shop":
          return daysSince(a.inventoryDate, a.shopDone) - daysSince(b.inventoryDate, b.shopDone)
        case "detail":
          return (
            daysSince(a.shopDone || a.inventoryDate, a.detailDone) -
            daysSince(b.shopDone || b.inventoryDate, b.detailDone)
          )
        case "photo":
          return (
            daysSince(a.detailDone || a.inventoryDate, a.photoDone) -
            daysSince(b.detailDone || b.inventoryDate, b.photoDone)
          )
        case "total":
        default:
          return (
            daysSince(a.inventoryDate, a.photoDone || new Date().toISOString().split("T")[0]) -
            daysSince(b.inventoryDate, b.photoDone || new Date().toISOString().split("T")[0])
          )
      }
    })

    return filtered
  }, [allVehicles, searchTerm, filterBy, sortBy])

  if (selectedVehicle) {
    return <VehicleTimeline vehicle={selectedVehicle} onClose={() => setSelectedVehicle(null)} />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Timeline Analysis</h2>
          <p className="text-gray-600">Track vehicle progression from inventory to front line</p>
        </div>
        <Button onClick={() => setShowGoalsSettings(true)} className="flex items-center gap-2">
          <Target className="h-4 w-4" />
          Goals & Alerts
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Shop Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageShopTime}</div>
            <p className="text-xs text-muted-foreground">days per vehicle</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Detail Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageDetailTime}</div>
            <p className="text-xs text-muted-foreground">days per vehicle</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Photo Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averagePhotoTime}</div>
            <p className="text-xs text-muted-foreground">days per vehicle</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Total Time</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.averageTotalTime}</div>
            <p className="text-xs text-muted-foreground">inventory to front line</p>
          </CardContent>
        </Card>
      </div>

      {/* Timeline Performance Overview */}
      <TimelinePerformanceOverview />

      {/* Timeline Alerts */}
      <TimelineAlertsPanel
        onViewVehicle={(vin) => {
          const vehicle = allVehicles.find((v) => v.vin === vin)
          if (vehicle) setSelectedVehicle(vehicle)
        }}
        onOpenSettings={() => setShowGoalsSettings(true)}
      />

      {/* Bottleneck Alert */}
      {stats.bottleneckStep !== "None" && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <div>
                <h3 className="font-semibold text-yellow-800">Bottleneck Detected</h3>
                <p className="text-sm text-yellow-700">
                  The <strong>{stats.bottleneckStep}</strong> step is taking the longest on average (
                  {stats.bottleneckStep === "Shop"
                    ? stats.averageShopTime
                    : stats.bottleneckStep === "Detail"
                      ? stats.averageDetailTime
                      : stats.averagePhotoTime}{" "}
                  days)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search vehicles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={filterBy} onValueChange={(value: any) => setFilterBy(value)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Vehicles</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="bottleneck">Has Bottlenecks</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="total">Total Time</SelectItem>
            <SelectItem value="shop">Shop Time</SelectItem>
            <SelectItem value="detail">Detail Time</SelectItem>
            <SelectItem value="photo">Photo Time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Vehicle List */}
      <div className="space-y-3">
        {filteredVehicles.map((vehicle) => {
          const totalTime = daysSince(
            vehicle.inventoryDate,
            vehicle.photoDone || new Date().toISOString().split("T")[0],
          )
          const isCompleted = vehicle.throughShop && vehicle.detailComplete && vehicle.photoComplete
          const hasBottleneck =
            (!vehicle.throughShop && daysSince(vehicle.inventoryDate) > 7) ||
            (vehicle.throughShop &&
              !vehicle.detailComplete &&
              daysSince(vehicle.shopDone || vehicle.inventoryDate) > 5) ||
            (vehicle.detailComplete &&
              !vehicle.photoComplete &&
              daysSince(vehicle.detailDone || vehicle.inventoryDate) > 3)

          return (
            <Card
              key={vehicle.vin}
              className={`cursor-pointer transition-all hover:shadow-md ${hasBottleneck ? "border-red-200 bg-red-50" : isCompleted ? "border-green-200 bg-green-50" : ""}`}
            >
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </h3>
                      <Badge variant="outline">{vehicle.stock}</Badge>
                      {isCompleted && <Badge className="bg-green-100 text-green-800">Complete</Badge>}
                      {hasBottleneck && <Badge variant="destructive">Bottleneck</Badge>}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Inventory</p>
                        <p className="font-medium">{formatDate(vehicle.inventoryDate)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Shop</p>
                        <p className="font-medium">
                          {vehicle.throughShop
                            ? `${daysSince(vehicle.inventoryDate, vehicle.shopDone)}d`
                            : `${daysSince(vehicle.inventoryDate)}d`}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Detail</p>
                        <p className="font-medium">
                          {vehicle.detailComplete
                            ? `${daysSince(vehicle.shopDone || vehicle.inventoryDate, vehicle.detailDone)}d`
                            : vehicle.throughShop
                              ? `${daysSince(vehicle.shopDone || vehicle.inventoryDate)}d`
                              : "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Photo</p>
                        <p className="font-medium">
                          {vehicle.photoComplete
                            ? `${daysSince(vehicle.detailDone || vehicle.inventoryDate, vehicle.photoDone)}d`
                            : vehicle.detailComplete
                              ? `${daysSince(vehicle.detailDone || vehicle.inventoryDate)}d`
                              : "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Total</p>
                        <p className="font-bold text-blue-600">{totalTime}d</p>
                      </div>
                    </div>
                  </div>

                  <Button variant="outline" size="sm" onClick={() => setSelectedVehicle(vehicle)} className="ml-4">
                    <Eye className="h-4 w-4 mr-2" />
                    View Timeline
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredVehicles.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No vehicles found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
        </div>
      )}
      {showGoalsSettings && <TimelineGoalsSettings onClose={() => setShowGoalsSettings(false)} />}
    </div>
  )
}
