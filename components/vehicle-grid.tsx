"use client"

import { useVehicleStore } from "@/lib/store"
import VehicleCard from "./vehicle-card"
import { Car } from "lucide-react"

export default function VehicleGrid() {
  const { filteredVehicles, loading } = useVehicleStore()

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (filteredVehicles.length === 0) {
    return (
      <div className="text-center py-12">
        <Car className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No vehicles found</h3>
        <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredVehicles.map((vehicle) => (
        <VehicleCard key={vehicle.vin} vehicle={vehicle} />
      ))}
    </div>
  )
}
