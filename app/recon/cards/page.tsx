"use client"

import { useState, useEffect } from "react"
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
}

export default function ReconCardsPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([])
  const [isLoading, setIsLoading] = useState(true)
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
          priority: getVehiclePriority(item),
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
      filtere
