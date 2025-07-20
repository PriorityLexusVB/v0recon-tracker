"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Car, Clock, CheckCircle, AlertTriangle, Filter, Search, RefreshCw, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface Vehicle {
  id: string
  stock: string
  vin: string
  year: number
  make: string
  model: string
  inventoryDate?: string
  daysInInventory: number
  throughShop: boolean
  detailComplete: boolean
  photoComplete?: boolean
  salesReady?: boolean
  price?: number
  status: "pending" | "in_shop" | "detail" | "photo" | "sales_ready" | "completed"
  priority?: "low" | "normal" | "high" | "urgent"
  assignedTo?: string
}

export default function ReconCardsPage() {
  const { user, isLoading } = useAuth()
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([])
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [makeFilter, setMakeFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [sortBy, setSortBy] = useState("daysInInventory")
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  useEffect(() => {
    loadVehicles()
  }, [])

  useEffect(() => {
    filterAndSortVehicles()
  }, [vehicles, searchTerm, statusFilter, makeFilter, priorityFilter, sortBy])

  const loadVehicles = async () => {
    setIsLoadingVehicles(true)
    try {
      const response = await fetch("/api/google-sheets")
      const data = await response.json()

      if (data.success && data.vehicles) {
        const vehicleData: Vehicle[] = data.vehicles.map((item: any, index: number) => ({
          id: item.id || `vehicle_${index}`,
          stock: item.id || `STK${index}`,
          vin: item.vin || "",
          year: item.year || new Date().getFullYear(),
          make: item.make || "Unknown",
          model: item.model || "Unknown",
          inventoryDate: item.inventoryDate,
          daysInInventory: item.daysInInventory || 0,
          throughShop: item.throughShop || false,
          detailComplete: item.detailComplete || false,
          photoComplete: item.photoComplete || false,
          salesReady: item.salesReady || false,
          price: item.price,
          status: getVehicleStatus(item),
          priority: getVehiclePriority(item),
          assignedTo: item.assignedTo,
        }))

        setVehicles(vehicleData)
        setLastUpdated(new Date())
        toast.success(`🚗 Loaded ${vehicleData.length} vehicles from vAuto`)
      } else {
        // Fallback to mock data for demo
        const mockVehicles: Vehicle[] = [
          {
            id: "1",
            stock: "A12345",
            vin: "1HGBH41JXMN109186",
            year: 2022,
            make: "Honda",
            model: "Accord",
            inventoryDate: "2024-01-15",
            daysInInventory: 5,
            throughShop: true,
            detailComplete: false,
            photoComplete: false,
            salesReady: false,
            price: 24500,
            status: "detail",
            priority: "normal",
            assignedTo: "John Smith",
          },
          {
            id: "2",
            stock: "B67890",
            vin: "1FTFW1ET5DFC10312",
            year: 2021,
            make: "Ford",
            model: "F-150",
            inventoryDate: "2024-01-10",
            daysInInventory: 10,
            throughShop: false,
            detailComplete: false,
            photoComplete: false,
            salesReady: false,
            price: 32000,
            status: "pending",
            priority: "high",
          },
          {
            id: "3",
            stock: "C11111",
            vin: "2T1BURHE0JC123456",
            year: 2023,
            make: "Toyota",
            model: "Camry",
            inventoryDate: "2024-01-12",
            daysInInventory: 8,
            throughShop: true,
            detailComplete: true,
            photoComplete: false,
            salesReady: false,
            price: 26000,
            status: "photo",
            priority: "normal",
            assignedTo: "Sarah Johnson",
          },
        ]
        setVehicles(mockVehicles)
        setLastUpdated(new Date())
        toast.info("🚗 Using demo data - Connect your vAuto feed for live data")
      }
    } catch (error) {
      console.error("Error loading vehicles:", error)
      toast.error("❌ Failed to load vehicle data")
    } finally {
      setIsLoadingVehicles(false)
    }
  }

  const getVehicleStatus = (vehicle: any): Vehicle["status"] => {
    if (vehicle.salesReady) return "sales_ready"
    if (vehicle.photoComplete) return "photo"
    if (vehicle.detailComplete) return "detail"
    if (vehicle.throughShop) return "in_shop"
    return "pending"
  }

  const getVehiclePriority = (vehicle: any): Vehicle["priority"] => {
    if (vehicle.daysInInventory > 14) return "urgent"
    if (vehicle.daysInInventory > 7) return "high"
    if (vehicle.daysInInventory > 3) return "normal"
    return "low"
  }

  const filterAndSortVehicles = () => {
    let filtered = vehicles

    // Apply filters
    if (searchTerm) {
      filtered = filtered.filter(
        (vehicle) =>
          vehicle.stock.toLowerCase().includes(searchTerm.toLowerCase()) ||
          vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
          vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
          vehicle.vin.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((vehicle) => vehicle.status === statusFilter)
    }

    if (makeFilter !== "all") {
      filtered = filtered.filter((vehicle) => vehicle.make === makeFilter)
    }

    if (priorityFilter !== "all") {
      filtered = filtered.filter((vehicle) => vehicle.priority === priorityFilter)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "daysInInventory":
          return b.daysInInventory - a.daysInInventory
        case "make":
          return a.make.localeCompare(b.make)
        case "year":
          return b.year - a.year
        case "status":
          return a.status.localeCompare(b.status)
        default:
          return 0
      }
    })

    setFilteredVehicles(filtered)
  }

  const getStatusColor = (status: Vehicle["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "sales_ready":
        return "bg-green-100 text-green-800"
      case "photo":
        return "bg-purple-100 text-purple-800"
      case "detail":
        return "bg-blue-100 text-blue-800"
      case "in_shop":
        return "bg-yellow-100 text-yellow-800"
      case "pending":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: Vehicle["priority"]) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800"
      case "high":
        return "bg-orange-100 text-orange-800"
      case "normal":
        return "bg-blue-100 text-blue-800"
      case "low":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: Vehicle["status"]) => {
    switch (status) {
      case "completed":
      case "sales_ready":
        return <CheckCircle className="h-4 w-4" />
      case "photo":
      case "detail":
      case "in_shop":
        return <Clock className="h-4 w-4" />
      case "pending":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <Car className="h-4 w-4" />
    }
  }

  const getProgress = (vehicle: Vehicle): number => {
    let progress = 0
    if (vehicle.throughShop) progress += 25
    if (vehicle.detailComplete) progress += 25
    if (vehicle.photoComplete) progress += 25
    if (vehicle.salesReady) progress += 25
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
    completed: vehicles.filter((v) => v.status === "sales_ready" || v.status === "completed").length,
    inProgress: vehicles.filter((v) => v.status === "in_shop" || v.status === "detail" || v.status === "photo").length,
    pending: vehicles.filter((v) => v.status === "pending").length,
    overdue: vehicles.filter((v) => v.daysInInventory > 7 && v.status === "pending").length,
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Recon Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.name || user?.email}</p>
          {lastUpdated && <p className="text-sm text-gray-500">Last updated: {lastUpdated.toLocaleTimeString()}</p>}
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={loadVehicles} disabled={isLoadingVehicles}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoadingVehicles ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vehicles</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">In recon process</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">Ready for sale</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
            <p className="text-xs text-muted-foreground">Being worked on</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Awaiting assignment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
            <p className="text-xs text-muted-foreground">Needs attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search vehicles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_shop">In Shop</SelectItem>
                <SelectItem value="detail">Detail</SelectItem>
                <SelectItem value="photo">Photo</SelectItem>
                <SelectItem value="sales_ready">Sales Ready</SelectItem>
              </SelectContent>
            </Select>

            <Select value={makeFilter} onValueChange={setMakeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Makes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Makes</SelectItem>
                {uniqueMakes.map((make) => (
                  <SelectItem key={make} value={make}>
                    {make}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daysInInventory">Days in Inventory</SelectItem>
                <SelectItem value="make">Make</SelectItem>
                <SelectItem value="year">Year</SelectItem>
                <SelectItem value="status">Status</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Vehicle Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoadingVehicles ? (
          <div className="col-span-full text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p>Loading vehicles...</p>
          </div>
        ) : filteredVehicles.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No vehicles found</p>
            <p className="text-sm text-gray-500">Try adjusting your filters or search terms</p>
          </div>
        ) : (
          filteredVehicles.map((vehicle) => (
            <Card key={vehicle.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </CardTitle>
                    <p className="text-sm text-gray-500">Stock: {vehicle.stock}</p>
                    <p className="text-xs text-gray-400 font-mono">VIN: ...{vehicle.vin.slice(-6)}</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Badge className={getStatusColor(vehicle.status)}>
                      {getStatusIcon(vehicle.status)}
                      <span className="ml-1 capitalize">{vehicle.status.replace("_", " ")}</span>
                    </Badge>
                    {vehicle.priority && (
                      <Badge className={getPriorityColor(vehicle.priority)} variant="outline">
                        {vehicle.priority}
                      </Badge>
                    )}
                    {vehicle.daysInInventory > 7 && vehicle.status === "pending" && (
                      <Badge variant="destructive" className="text-xs">
                        Overdue
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Progress Bar */}
                  <div>
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                      <span>Progress</span>
                      <span>{getProgress(vehicle)}%</span>
                    </div>
                    <Progress value={getProgress(vehicle)} className="h-2" />
                  </div>

                  {/* Vehicle Details */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-600">Days in Inventory</p>
                      <p className="font-medium">{vehicle.daysInInventory}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Inventory Date</p>
                      <p className="font-medium">{vehicle.inventoryDate || "N/A"}</p>
                    </div>
                  </div>

                  {vehicle.assignedTo && (
                    <div className="text-sm">
                      <p className="text-gray-600">Assigned to</p>
                      <p className="font-medium">{vehicle.assignedTo}</p>
                    </div>
                  )}

                  {vehicle.price && (
                    <div className="pt-2 border-t">
                      <p className="text-sm text-gray-600">
                        Price: <span className="font-medium">${vehicle.price.toLocaleString()}</span>
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-2 pt-2">
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                    <Button size="sm">Update Status</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
