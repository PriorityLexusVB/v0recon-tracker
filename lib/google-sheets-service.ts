interface Vehicle {
  id: string
  vin: string
  year: string
  make: string
  model: string
  inventoryDate: string
  throughShop: boolean
  shopDoneDate: string
  detailComplete: boolean
  detailDoneDate: string
  daysInInventory: number
  daysToShop: number
  daysToDetail: number
  status: "in-shop" | "in-detail" | "completed"
}

interface GoogleSheetsResponse {
  success: boolean
  gidUsed?: string
  totalVehicles?: number
  headers?: string[]
  vehicles?: Vehicle[]
  lastUpdated?: string
  responseTime?: number
  integration?: string
  error?: string
  details?: string
  troubleshooting?: string[]
  parseErrors?: string[]
  dataQuality?: {
    totalRows: number
    successfullyParsed: number
    parseErrorCount: number
    completionRate: number
  }
}

interface CompletionStats {
  total: number
  inShop: number
  inDetail: number
  completed: number
  averageDaysToShop: number
  averageDaysToDetail: number
  completionRate: number
  shopRate: number
}

export class GoogleSheetsService {
  private static instance: GoogleSheetsService
  private cache: { data: Vehicle[]; lastFetch: number } | null = null
  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  static getInstance(): GoogleSheetsService {
    if (!GoogleSheetsService.instance) {
      GoogleSheetsService.instance = new GoogleSheetsService()
    }
    return GoogleSheetsService.instance
  }

  async fetchVehicles(): Promise<Vehicle[]> {
    // Check cache first
    if (this.cache && Date.now() - this.cache.lastFetch < this.CACHE_DURATION) {
      console.log(`[${new Date().toISOString()}] Returning cached vehicle data (${this.cache.data.length} vehicles)`)
      return this.cache.data
    }

    try {
      console.log(`[${new Date().toISOString()}] Fetching fresh vehicle data from Google Sheets`)
      const response = await fetch("/api/google-sheets")
      const data: GoogleSheetsResponse = await response.json()

      if (!data.success || !data.vehicles) {
        throw new Error(data.error || "Failed to fetch vehicles from Google Sheets")
      }

      // Update cache
      this.cache = {
        data: data.vehicles,
        lastFetch: Date.now(),
      }

      console.log(`[${new Date().toISOString()}] Successfully fetched ${data.vehicles.length} vehicles`)
      return data.vehicles
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Error fetching vehicles:`, error)

      // Return cached data if available, even if stale
      if (this.cache) {
        console.log(`[${new Date().toISOString()}] Returning stale cached data due to error`)
        return this.cache.data
      }

      throw error
    }
  }

  async getVehicleById(id: string): Promise<Vehicle | null> {
    const vehicles = await this.fetchVehicles()
    return vehicles.find((v) => v.id === id) || null
  }

  async getVehiclesByStatus(status: Vehicle["status"]): Promise<Vehicle[]> {
    const vehicles = await this.fetchVehicles()
    return vehicles.filter((v) => v.status === status)
  }

  async getOverdueVehicles(daysThreshold = 7): Promise<Vehicle[]> {
    const vehicles = await this.fetchVehicles()
    return vehicles.filter((v) => v.daysInInventory > daysThreshold && v.status !== "completed")
  }

  async getCompletionStats(): Promise<CompletionStats> {
    const vehicles = await this.fetchVehicles()
    const total = vehicles.length

    if (total === 0) {
      return {
        total: 0,
        inShop: 0,
        inDetail: 0,
        completed: 0,
        averageDaysToShop: 0,
        averageDaysToDetail: 0,
        completionRate: 0,
        shopRate: 0,
      }
    }

    const inShop = vehicles.filter((v) => v.status === "in-shop").length
    const inDetail = vehicles.filter((v) => v.status === "in-detail").length
    const completed = vehicles.filter((v) => v.status === "completed").length

    const vehiclesWithShopDays = vehicles.filter((v) => v.daysToShop > 0)
    const vehiclesWithDetailDays = vehicles.filter((v) => v.daysToDetail > 0)

    const averageDaysToShop =
      vehiclesWithShopDays.length > 0
        ? Math.round(vehiclesWithShopDays.reduce((sum, v) => sum + v.daysToShop, 0) / vehiclesWithShopDays.length)
        : 0

    const averageDaysToDetail =
      vehiclesWithDetailDays.length > 0
        ? Math.round(vehiclesWithDetailDays.reduce((sum, v) => sum + v.daysToDetail, 0) / vehiclesWithDetailDays.length)
        : 0

    const completionRate = Math.round((completed / total) * 100)
    const shopRate = Math.round(((inDetail + completed) / total) * 100)

    return {
      total,
      inShop,
      inDetail,
      completed,
      averageDaysToShop,
      averageDaysToDetail,
      completionRate,
      shopRate,
    }
  }

  async getVehiclesByMake(): Promise<Record<string, number>> {
    const vehicles = await this.fetchVehicles()
    const byMake: Record<string, number> = {}

    vehicles.forEach((vehicle) => {
      if (vehicle.make) {
        byMake[vehicle.make] = (byMake[vehicle.make] || 0) + 1
      }
    })

    return byMake
  }

  async getRecentlyCompleted(days = 7): Promise<Vehicle[]> {
    const vehicles = await this.fetchVehicles()
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)

    return vehicles.filter((vehicle) => {
      if (vehicle.status !== "completed" || !vehicle.detailDoneDate) {
        return false
      }

      try {
        const completedDate = new Date(vehicle.detailDoneDate)
        return completedDate >= cutoffDate
      } catch {
        return false
      }
    })
  }

  async testConnection(): Promise<GoogleSheetsResponse> {
    try {
      console.log(`[${new Date().toISOString()}] Testing Google Sheets connection`)
      const response = await fetch("/api/google-sheets")
      const data: GoogleSheetsResponse = await response.json()

      console.log(`[${new Date().toISOString()}] Connection test result:`, {
        success: data.success,
        totalVehicles: data.totalVehicles,
        error: data.error,
      })

      return data
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Connection test failed:`, error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown connection error",
        troubleshooting: [
          "Check your internet connection",
          "Verify Google Sheets URL is correct",
          "Make sure the sheet is publicly accessible",
          "Try refreshing the page",
        ],
      }
    }
  }

  clearCache(): void {
    console.log(`[${new Date().toISOString()}] Clearing Google Sheets cache`)
    this.cache = null
  }

  getCacheStatus(): { cached: boolean; age: number; size: number } {
    if (!this.cache) {
      return { cached: false, age: 0, size: 0 }
    }

    return {
      cached: true,
      age: Date.now() - this.cache.lastFetch,
      size: this.cache.data.length,
    }
  }

  async refreshData(): Promise<Vehicle[]> {
    console.log(`[${new Date().toISOString()}] Force refreshing Google Sheets data`)
    this.clearCache()
    return this.fetchVehicles()
  }
}

// Export singleton instance
export const googleSheetsService = GoogleSheetsService.getInstance()

// Export types for use in other files
export type { Vehicle, GoogleSheetsResponse, CompletionStats }
