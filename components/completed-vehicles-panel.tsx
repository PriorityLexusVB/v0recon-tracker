"use client"

import { useState } from "react"
import { useVehicleStore } from "@/lib/vehicle-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, RotateCcw, Trash2, Calendar, Car, ChevronDown, ChevronUp } from "lucide-react"
import { formatDate } from "@/lib/utils"
import type { Vehicle } from "@/lib/types"

export default function CompletedVehiclesPanel() {
  const { completedVehicles, restoreCompletedVehicle, permanentlyRemoveVehicle } = useVehicleStore()
  const [isExpanded, setIsExpanded] = useState(false)
  const [showAll, setShowAll] = useState(false)

  if (completedVehicles.length === 0) {
    return null
  }

  const displayedVehicles = showAll ? completedVehicles : completedVehicles.slice(0, 3)

  const handleRestore = (vin: string) => {
    if (confirm("Are you sure you want to restore this vehicle to active status?")) {
      restoreCompletedVehicle(vin)
    }
  }

  const handlePermanentRemove = (vin: string) => {
    if (confirm("Are you sure you want to permanently remove this vehicle? This action cannot be undone.")) {
      permanentlyRemoveVehicle(vin)
    }
  }

  const getCompletionDate = (vehicle: Vehicle) => {
    const dates = [
      vehicle.shopDone ? new Date(vehicle.shopDone) : null,
      vehicle.detailDone ? new Date(vehicle.detailDone) : null,
      vehicle.photoDone ? new Date(vehicle.photoDone) : null,
    ].filter(Boolean) as Date[]

    if (dates.length === 0) return "Unknown"

    const latestDate = new Date(Math.max(...dates.map((d) => d.getTime())))
    return formatDate(latestDate.toISOString().split("T")[0])
  }

  return (
    <Card className="border-green-200 bg-green-50">
      <CardHeader className="cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-green-800">
            <CheckCircle className="h-5 w-5" />
            Completed Vehicles
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              {completedVehicles.length}
            </Badge>
          </CardTitle>
          {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </div>
        <p className="text-sm text-green-700">Vehicles that have completed all reconditioning steps</p>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4">
          <div className="grid gap-3">
            {displayedVehicles.map((vehicle) => (
              <div
                key={vehicle.vin}
                className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-200"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Car className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-sm">
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {vehicle.stock}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-600">
                    <span>VIN: {vehicle.vin}</span>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Completed: {getCompletionDate(vehicle)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRestore(vehicle.vin)}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Restore
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePermanentRemove(vehicle.vin)}
                    className="flex items-center gap-1 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {completedVehicles.length > 3 && (
            <div className="text-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAll(!showAll)}
                className="text-green-700 hover:text-green-800"
              >
                {showAll ? "Show Less" : `Show All ${completedVehicles.length} Completed`}
              </Button>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}
