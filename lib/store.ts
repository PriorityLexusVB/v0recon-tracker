"use client"

import { create } from "zustand"
import type { Vehicle, FilterState, VehicleStats } from "./types"
import type React from "react"
import { createContext, useContext } from "react"
import { useNotificationStore, type NotificationStore } from "./notification-store"
import { useAnalyticsStore, type AnalyticsStore } from "./analytics-store"
import { useAuth } from "@/hooks/use-auth" // Assuming useAuth provides user ID

interface VehicleStore {
  vehicles: Vehicle[]
  filteredVehicles: Vehicle[]
  filters: FilterState
  stats: VehicleStats
  loading: boolean
  setVehicles: (vehicles: Vehicle[]) => void
  setFilters: (newFilters: Partial<FilterState>) => void
  setLoading: (loading: boolean) => void
  calculateStats: () => void
  applyFilters: () => void
}

interface AppState {
  isSidebarOpen: boolean
  toggleSidebar: () => void
  closeSidebar: () => void
}

interface AppStore {
  vehicleStore: VehicleStore
  notificationStore: NotificationStore
  analyticsStore: AnalyticsStore
}

const isOverdue = (date: string | undefined, completed: boolean): boolean => {
  if (!date || completed) return false
  const targetDate = new Date(date)
  const today = new Date()
  const diffTime = today.getTime() - targetDate.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays > 0
}

const getOverdueDays = (date: string | undefined, completed: boolean): number => {
  if (!date || completed) return 0
  const targetDate = new Date(date)
  const today = new Date()
  const diffTime = today.getTime() - targetDate.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

const AppStoreContext = createContext<AppStore | undefined>(undefined)

export function AppStoreProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth() // Get current user from auth hook
  const vehicleStore = useVehicleStore()
  const notificationStore = useNotificationStore(user?.id) // Pass user ID to notification store
  const analyticsStore = useAnalyticsStore()

  const store: AppStore = {
    vehicleStore,
    notificationStore,
    analyticsStore,
  }

  return <AppStoreContext.Provider value={store}>{children}</AppStoreContext.Provider>
}

export function useAppStore() {
  const context = useContext(AppStoreContext)
  if (context === undefined) {
    throw new Error("useAppStore must be used within an AppStoreProvider")
  }
  return context
}

export const useVehicleStore = create<VehicleStore>((set, get) => ({
  vehicles: [],
  filteredVehicles: [],
  filters: {
    search: "",
    status: "all",
    activeStatFilter: undefined, // Added activeStatFilter to FilterState
  },
  stats: {
    total: 0,
    completed: 0,
    overdue: 0,
    overdueShop: 0,
    overdueDetail: 0,
    overduePhoto: 0,
  },
  loading: true,

  setVehicles: (vehicles) => {
    set({ vehicles })
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
    const { vehicles } = get()
    const total = vehicles.length
    const completed = vehicles.filter((v) => v.throughShop && v.detailComplete && v.photoComplete).length

    let overdue = 0
    let overdueShop = 0
    let overdueDetail = 0
    let overduePhoto = 0

    vehicles.forEach((vehicle) => {
      const shopOverdue = isOverdue(vehicle.shopDone, vehicle.throughShop)
      const detailOverdue = isOverdue(vehicle.detailDone, vehicle.detailComplete)
      const photoOverdue = isOverdue(vehicle.photoDone, vehicle.photoComplete)

      if (shopOverdue) overdueShop++
      if (detailOverdue) overdueDetail++
      if (photoOverdue) overduePhoto++
      if (shopOverdue || detailOverdue || photoOverdue) overdue++
    })

    set({
      stats: {
        total,
        completed,
        overdue,
        overdueShop,
        overdueDetail,
        overduePhoto,
      },
    })
  },

  applyFilters: () => {
    const { vehicles, filters } = get()
    let filtered = [...vehicles]

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
          case "completed":
            return isCompleted
          case "pending":
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
}))

// This file is intentionally left blank as general application state management
// is handled by individual components or specific stores (e.g., useAuth hook).
// If a centralized global store is needed, this file could be used.

// Example usage in a component:
// import { useAppStore } from '@/lib/store';
// const { vehicleStore, notificationStore } = useAppStore();
// const { vehicles, loading: vehiclesLoading } = vehicleStore;
// const { unreadCount, fetchNotifications } = notificationStore;
