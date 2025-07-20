"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Car,
  Search,
  RefreshCw,
  CheckCircle,
  Clock,
  AlertTriangle,
  BarChart3,
  Calendar,
  Wrench,
  Sparkles,
  Camera,
  DollarSign,
  Loader2,
  Smartphone,
  Wifi,
  WifiOff,
} from "lucide-react"
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
}

export default function MobilePage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isOnline, setIsOnline] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [makeFilter, setMakeFilter] = useState("all")
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  useEffect(() => {
    loadVehicles()

    // Check online status
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  useEffect(() => {
    filterVehicles()
  }, [vehicles, searchTerm, statusFilter, makeFilter])

  const loadVehicles = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/google-sheets")
      const data = await response.json()

      if (data.success && data.data) {
        const vehicleData: Vehicle[] = data.data.map((item: any, index: number) => ({
          id: item.stock || `vehicle_${index}`,
          stock: item.stock || `STK${index}`,
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
        }))

        setVehicles(vehicleData)
        setLastUpdated(new Date())
        toast.success(`📱 Loaded ${vehicleData.length} vehicles from vAuto`)
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
          },
        ]
        setVehicles(mockVehicles)
        setLastUpdated(new Date())
        toast.info("📱 Using demo data - Connect your vAuto feed for live data")
      }
    } catch (error) {
      console.error("Error loading vehicles:", error)
      toast.error("❌ Failed to load vehicle data")
    } finally {
      setIsLoading(false)
    }
  }

  const getVehicleStatus = (vehicle: any): Vehicle["status"] => {
    if (vehicle.salesReady) return "sales_ready"
    if (vehicle.photoComplete) return "photo"
    if (vehicle.detailComplete) return "detail"
    if (vehicle.throughShop) return "in_shop"
    return "pending"
  }

  const filterVehicles = () => {
    let filtered = vehicles

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

    setFilteredVehicles(filtered)
  }

  const getStatusIcon = (status: Vehicle["status"]) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />
      case "in_shop":
        return <Wrench className="h-4 w-4 text-blue-600" />
      case "detail":
        return <Sparkles className="h-4 w-4 text-purple-600" />
      case "photo":
        return <Camera className="h-4 w-4 text-green-600" />
      case "sales_ready":
        return <DollarSign className="h-4 w-4 text-green-700" />
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusBadge = (status: Vehicle["status"]) => {
    const configs = {
      pending: { label: "Pending", className: "bg-yellow-100 text-yellow-800" },
      in_shop: { label: "In Shop", className: "bg-blue-100 text-blue-800" },
      detail: { label: "Detail", className: "bg-purple-100 text-purple-800" },
      photo: { label: "Photo", className: "bg-green-100 text-green-800" },
      sales_ready: { label: "Sales Ready", className: "bg-green-100 text-green-800" },
      completed: { label: "Completed", className: "bg-gray-100 text-gray-800" },
    }

    const config = configs[status] || configs.pending
    return <Badge className={config.className}>{config.label}</Badge>
  }

  const uniqueMakes = Array.from(new Set(vehicles.map((v) => v.make))).sort()

  const stats = {
    total: vehicles.length,
    pending: vehicles.filter((v) => v.status === "pending").length,
    inShop: vehicles.filter((v) => v.status === "in_shop").length,
    detail: vehicles.filter((v) => v.status === "detail").length,
    photo: vehicles.filter((v) => v.status === "photo").length,
    salesReady: vehicles.filter((v) => v.status === "sales_ready").length,
    overdue: vehicles.filter((v) => v.daysInInventory > 7 && v.status === "pending").length,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-blue-600" />
              <h1 className="text-lg font-bold">Recon Tracker</h1>
            </div>
            <div className="flex items-center gap-2">
              {isOnline ? <Wifi className="h-4 w-4 text-green-600" /> : <WifiOff className="h-4 w-4 text-red-600" />}
              <Button size="sm" variant="outline" onClick={loadVehicles} disabled={isLoading}>
                <RefreshCw className={`h-3 w-3 ${isLoading ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search stock, make, model, VIN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Status" />
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
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Make" />
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
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Connection Status */}
        {!isOnline && (
          <Alert>
            <WifiOff className="h-4 w-4" />
            <AlertDescription>
              You're offline. Data may not be current. Connect to internet to refresh.
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Total</p>
                <p className="text-lg font-bold">{stats.total}</p>
              </div>
              <Car className="h-5 w-5 text-blue-600" />
            </div>
          </Card>

          <Card className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Overdue</p>
                <p className="text-lg font-bold text-red-600">{stats.overdue}</p>
              </div>
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
          </Card>

          <Card className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">In Shop</p>
                <p className="text-lg font-bold text-blue-600">{stats.inShop}</p>
              </div>
              <Wrench className="h-5 w-5 text-blue-600" />
            </div>
          </Card>

          <Card className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Sales Ready</p>
                <p className="text-lg font-bold text-green-600">{stats.salesReady}</p>
              </div>
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
          </Card>
        </div>

        <Tabs defaultValue="vehicles" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="vehicles">Vehicles ({filteredVehicles.length})</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="vehicles" className="space-y-3">
            {isLoading ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                <p className="text-sm text-gray-600">Loading vehicles...</p>
              </div>
            ) : filteredVehicles.length === 0 ? (
              <div className="text-center py-8">
                <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No vehicles found</p>
                <p className="text-sm text-gray-500">Try adjusting your filters</p>
              </div>
            ) : (
              filteredVehicles.map((vehicle) => (
                <Card key={vehicle.id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm">
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </h3>
                      <p className="text-xs text-gray-600">Stock: {vehicle.stock}</p>
                      {vehicle.vin && (
                        <p className="text-xs text-gray-500 font-mono">VIN: ...{vehicle.vin.slice(-6)}</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {getStatusBadge(vehicle.status)}
                      {vehicle.daysInInventory > 7 && vehicle.status === "pending" && (
                        <Badge variant="destructive" className="text-xs">
                          Overdue
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-gray-600">Days in Inventory</p>
                      <p className="font-medium">{vehicle.daysInInventory}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Inventory Date</p>
                      <p className="font-medium">{vehicle.inventoryDate || "N/A"}</p>
                    </div>
                  </div>

                  {vehicle.price && (
                    <div className="mt-2 pt-2 border-t">
                      <p className="text-xs text-gray-600">Price: ${vehicle.price.toLocaleString()}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-3 pt-2 border-t">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        {getStatusIcon(vehicle.status)}
                        <span className="text-xs">{getStatusBadge(vehicle.status).props.children}</span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <div className={`w-2 h-2 rounded-full ${vehicle.throughShop ? "bg-blue-500" : "bg-gray-300"}`} />
                      <div
                        className={`w-2 h-2 rounded-full ${vehicle.detailComplete ? "bg-purple-500" : "bg-gray-300"}`}
                      />
                      <div
                        className={`w-2 h-2 rounded-full ${vehicle.photoComplete ? "bg-green-500" : "bg-gray-300"}`}
                      />
                      <div className={`w-2 h-2 rounded-full ${vehicle.salesReady ? "bg-green-700" : "bg-gray-300"}`} />
                    </div>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <Card className="p-4">
                <CardHeader className="p-0 mb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Status Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Pending</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-gray-200 rounded-full">
                          <div
                            className="h-2 bg-yellow-500 rounded-full"
                            style={{ width: `${(stats.pending / stats.total) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{stats.pending}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">In Shop</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-gray-200 rounded-full">
                          <div
                            className="h-2 bg-blue-500 rounded-full"
                            style={{ width: `${(stats.inShop / stats.total) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{stats.inShop}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Detail</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-gray-200 rounded-full">
                          <div
                            className="h-2 bg-purple-500 rounded-full"
                            style={{ width: `${(stats.detail / stats.total) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{stats.detail}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Photo</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-gray-200 rounded-full">
                          <div
                            className="h-2 bg-green-500 rounded-full"
                            style={{ width: `${(stats.photo / stats.total) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{stats.photo}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Sales Ready</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-gray-200 rounded-full">
                          <div
                            className="h-2 bg-green-700 rounded-full"
                            style={{ width: `${(stats.salesReady / stats.total) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{stats.salesReady}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="p-4">
                <CardHeader className="p-0 mb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-blue-600">
                        {vehicles.length > 0
                          ? Math.round(vehicles.reduce((sum, v) => sum + v.daysInInventory, 0) / vehicles.length)
                          : 0}
                      </p>
                      <p className="text-xs text-gray-600">Avg Days</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600">
                        {vehicles.length > 0 ? Math.round(((stats.salesReady + stats.photo) / stats.total) * 100) : 0}%
                      </p>
                      <p className="text-xs text-gray-600">Completion Rate</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Last Updated */}
        {lastUpdated && (
          <div className="text-center text-xs text-gray-500 pb-4">Last updated: {lastUpdated.toLocaleTimeString()}</div>
        )}
      </div>
    </div>
  )
}
