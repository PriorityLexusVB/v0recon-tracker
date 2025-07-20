import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Vehicle } from "./types"
import { isOverdue } from "./utils"

export interface VehicleFilters {
  search: string
  status: string
  activeStatFilter?: "total" | "completed" | "overdue"
  showCompleted: boolean
}

export interface VehicleStats {
  total: number
  completed: number
  overdue: number
  needsAttention: number
}

interface VehicleStore {
  vehicles: Vehicle[]
  completedVehicles: Vehicle[]
  filteredVehicles: Vehicle[]
  filters: VehicleFilters
  stats: VehicleStats
  loading: boolean
  lastCompletedVehicle: Vehicle | null // Track last completed vehicle for celebration

  // Actions
  setVehicles: (vehicles: Vehicle[]) => void
  updateVehicle: (vin: string, updates: Partial<Vehicle>) => void
  setFilters: (filters: Partial<VehicleFilters>) => void
  setLoading: (loading: boolean) => void
  calculateStats: () => void
  applyFilters: () => void
  syncToGoogleSheets: (vehicle: Vehicle) => Promise<void>
  getAllVehicles: () => Vehicle[]
  restoreCompletedVehicle: (vin: string) => void
  permanentlyRemoveVehicle: (vin: string) => void
  clearLastCompletedVehicle: () => void // Clear celebration state
  setStats: (stats: VehicleStats) => void
}

export const useVehicleStore = create<VehicleStore>()(
  persist(
    (set, get) => ({
      vehicles: [],
      completedVehicles: [],
      filteredVehicles: [],
      filters: {
        search: "",
        status: "all",
        showCompleted: false,
      },
      stats: {
        total: 0,
        completed: 0,
        overdue: 0,
        needsAttention: 0,
      },
      loading: true,
      lastCompletedVehicle: null,

      setVehicles: (vehicles) => {
        // Separate completed and active vehicles
        const activeVehicles = vehicles.filter((v) => !(v.throughShop && v.detailComplete && v.photoComplete))
        const completedVehicles = vehicles.filter((v) => v.throughShop && v.detailComplete && v.photoComplete)

        set({
          vehicles: activeVehicles,
          completedVehicles: [...get().completedVehicles, ...completedVehicles],
        })
        get().calculateStats()
        get().applyFilters()
      },

      updateVehicle: async (vin, updates) => {
        const { vehicles, completedVehicles } = get()

        // Check if vehicle is in active or completed list
        const isInActive = vehicles.some((v) => v.vin === vin)
        const isInCompleted = completedVehicles.some((v) => v.vin === vin)

        if (isInActive) {
          const updatedVehicles = vehicles.map((vehicle) =>
            vehicle.vin === vin ? { ...vehicle, ...updates } : vehicle,
          )

          // Check if the updated vehicle is now completed
          const updatedVehicle = updatedVehicles.find((v) => v.vin === vin)
          if (
            updatedVehicle &&
            updatedVehicle.throughShop &&
            updatedVehicle.detailComplete &&
            updatedVehicle.photoComplete
          ) {
            // Move to completed vehicles
            const remainingVehicles = updatedVehicles.filter((v) => v.vin !== vin)
            const newCompletedVehicles = [...completedVehicles, updatedVehicle]

            set({
              vehicles: remainingVehicles,
              completedVehicles: newCompletedVehicles,
              lastCompletedVehicle: updatedVehicle, // Set for celebration
            })
          } else {
            set({ vehicles: updatedVehicles })
          }

          // Sync to Google Sheets
          if (updatedVehicle) {
            await get().syncToGoogleSheets(updatedVehicle)
          }
        } else if (isInCompleted) {
          // Update completed vehicle
          const updatedCompletedVehicles = completedVehicles.map((vehicle) =>
            vehicle.vin === vin ? { ...vehicle, ...updates } : vehicle,
          )
          set({ completedVehicles: updatedCompletedVehicles })
        }

        get().calculateStats()
        get().applyFilters()
      },

      setFilters: (newFilters) => {
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
        }))
        get().applyFilters()
      },

      setLoading: (loading) => set({ loading }),

      calculateStats: () => {
        const { vehicles, completedVehicles } = get()
        const allVehicles = [...vehicles, ...completedVehicles]

        const total = vehicles.length
        const completed = completedVehicles.length
        const totalIncludingCompleted = allVehicles.length

        let overdue = 0
        let needsAttention = 0

        vehicles.forEach((vehicle) => {
          const shopOverdue = isOverdue(vehicle.shopDone, vehicle.throughShop)
          const detailOverdue = isOverdue(vehicle.detailDone, vehicle.detailComplete)
          const photoOverdue = isOverdue(vehicle.photoDone, vehicle.photoComplete)

          if (shopOverdue || detailOverdue || photoOverdue) {
            overdue++
          }

          if (!vehicle.throughShop || !vehicle.detailComplete || !vehicle.photoComplete) {
            needsAttention++
          }
        })

        set({
          stats: {
            total,
            completed,
            overdue,
            needsAttention,
          },
        })
      },

      applyFilters: () => {
        const { vehicles, completedVehicles, filters } = get()

        const vehiclesToFilter = filters.showCompleted ? [...vehicles, ...completedVehicles] : vehicles
        let filtered = [...vehiclesToFilter]

        // Apply search filter
        if (filters.search) {
          const searchLower = filters.search.toLowerCase()
          filtered = filtered.filter(
            (vehicle) =>
              vehicle.vin.toLowerCase().includes(searchLower) ||
              vehicle.stock.toLowerCase().includes(searchLower) ||
              vehicle.make.toLowerCase().includes(searchLower) ||
              vehicle.model.toLowerCase().includes(searchLower),
          )
        }

        // Apply status filter
        if (filters.status !== "all") {
          filtered = filtered.filter((vehicle) => {
            const isCompleted = vehicle.throughShop && vehicle.detailComplete && vehicle.photoComplete
            const hasOverdue =
              isOverdue(vehicle.shopDone, vehicle.throughShop) ||
              isOverdue(vehicle.detailDone, vehicle.detailComplete) ||
              isOverdue(vehicle.photoDone, vehicle.photoComplete)

            switch (filters.status) {
              case "complete":
                return isCompleted
              case "needs-attention":
                return !isCompleted && !hasOverdue
              case "overdue":
                return hasOverdue
              default:
                return true
            }
          })
        }

        // Apply stat filter
        if (filters.activeStatFilter) {
          filtered = filtered.filter((vehicle) => {
            const isCompleted = vehicle.throughShop && vehicle.detailComplete && vehicle.photoComplete
            const hasOverdue =
              isOverdue(vehicle.shopDone, vehicle.throughShop) ||
              isOverdue(vehicle.detailDone, vehicle.detailComplete) ||
              isOverdue(vehicle.photoDone, vehicle.photoComplete)

            switch (filters.activeStatFilter) {
              case "completed":
                return isCompleted
              case "overdue":
                return hasOverdue
              case "total":
              default:
                return true
            }
          })
        }

        set({ filteredVehicles: filtered })
      },

      getAllVehicles: () => {
        const { vehicles, completedVehicles } = get()
        return [...vehicles, ...completedVehicles]
      },

      restoreCompletedVehicle: (vin) => {
        const { completedVehicles, vehicles } = get()
        const vehicleToRestore = completedVehicles.find((v) => v.vin === vin)

        if (vehicleToRestore) {
          const updatedCompletedVehicles = completedVehicles.filter((v) => v.vin !== vin)
          const updatedActiveVehicles = [...vehicles, vehicleToRestore]

          set({
            vehicles: updatedActiveVehicles,
            completedVehicles: updatedCompletedVehicles,
          })

          get().calculateStats()
          get().applyFilters()
        }
      },

      permanentlyRemoveVehicle: (vin) => {
        const { completedVehicles, vehicles } = get()

        set({
          vehicles: vehicles.filter((v) => v.vin !== vin),
          completedVehicles: completedVehicles.filter((v) => v.vin !== vin),
        })

        get().calculateStats()
        get().applyFilters()
      },

      clearLastCompletedVehicle: () => {
        set({ lastCompletedVehicle: null })
      },

      syncToGoogleSheets: async (vehicle) => {
        try {
          const GOOGLE_SHEETS_URL = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_URL

          if (!GOOGLE_SHEETS_URL) {
            console.warn("Google Sheets URL not configured - skipping sync")
            return
          }

          const payload = {
            vin: vehicle.vin,
            stock: vehicle.stock,
            make: vehicle.make,
            model: vehicle.model,
            year: vehicle.year,
            status: vehicle.throughShop && vehicle.detailComplete && vehicle.photoComplete ? "Complete" : "In Progress",
            shopDone: vehicle.shopDone || "",
            detailDone: vehicle.detailDone || "",
            photoDone: vehicle.photoDone || "",
          }

          const response = await fetch(GOOGLE_SHEETS_URL, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
            mode: "no-cors",
          })

          console.log("Synced to Google Sheets successfully")
        } catch (error) {
          console.error("Failed to sync to Google Sheets:", error)
        }
      },

      setStats: (stats) => set({ stats }),
    }),
    {
      name: "vehicle-store",
      partialize: (state) => ({
        vehicles: state.vehicles,
        completedVehicles: state.completedVehicles,
        filters: state.filters,
      }),
    },
  ),
)
