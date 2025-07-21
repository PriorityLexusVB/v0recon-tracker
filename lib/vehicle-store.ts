"use client"

// This file could be used for client-side state management for vehicles
// For example, using Zustand or React Context to manage vehicle lists,
// filtering, and real-time updates.

import { useState, useEffect, useCallback } from "react"
import type { Vehicle, User, TimelineEvent } from "@prisma/client" // Import Prisma's generated types
import { fetchVehicles, fetchVehicleByVin, fetchVehicleById } from "@/app/actions/vehicles" // Import server actions

// Extend Prisma's Vehicle type to include relations if needed for client-side display
export interface VehicleWithRelations extends Vehicle {
  assignedTo?: User | null
  timelineEvents?: TimelineEvent[]
}

interface VehicleStore {
  vehicles: VehicleWithRelations[]
  loading: boolean
  error: string | null
  fetchVehicles: (
    query?: string,
    status?: string,
    assignedToId?: string,
    page?: number,
    limit?: number,
  ) => Promise<void>
  fetchSingleVehicle: (id: string) => Promise<VehicleWithRelations | null>
  fetchVehicleByVin: (vin: string) => Promise<VehicleWithRelations | null>
  totalPages: number
  currentPage: number
}

export function useVehicleStore(): VehicleStore {
  const [vehicles, setVehicles] = useState<VehicleWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalPages, setTotalPages] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)

  const fetchVehiclesData = useCallback(
    async (query?: string, status?: string, assignedToId?: string, page = 1, limit = 10) => {
      setLoading(true)
      setError(null)
      try {
        const result = await fetchVehicles(query, status, assignedToId, page, limit)
        if (result.success) {
          setVehicles(result.vehicles)
          setTotalPages(result.totalPages)
          setCurrentPage(result.currentPage)
        } else {
          setError(result.message || "Failed to fetch vehicles.")
        }
      } catch (err) {
        setError("Failed to fetch vehicles.")
        console.error("Error fetching vehicles:", err)
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  const fetchSingleVehicle = useCallback(async (id: string): Promise<VehicleWithRelations | null> => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetchVehicleById(id)
      if (result.success) {
        return result.vehicle
      } else {
        setError(result.message || "Failed to fetch vehicle.")
        return null
      }
    } catch (err) {
      setError("Failed to fetch vehicle.")
      console.error("Error fetching single vehicle:", err)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchVehicleByVinData = useCallback(async (vin: string): Promise<VehicleWithRelations | null> => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetchVehicleByVin(vin)
      if (result.success) {
        return result.vehicle
      } else {
        setError(result.message || "Failed to fetch vehicle by VIN.")
        return null
      }
    } catch (err) {
      setError("Failed to fetch vehicle by VIN.")
      console.error("Error fetching vehicle by VIN:", err)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial load or when dependencies change
  useEffect(() => {
    fetchVehiclesData()
  }, [fetchVehiclesData])

  return {
    vehicles,
    loading,
    error,
    fetchVehicles: fetchVehiclesData,
    fetchSingleVehicle,
    fetchVehicleByVin: fetchVehicleByVinData,
    totalPages,
    currentPage,
  }
}
