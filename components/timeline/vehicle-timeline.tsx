"use client"

import { Badge } from "@/components/ui/badge"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Clock, CheckCircle, Loader2, Car } from "lucide-react"
import { getVehicleTimeline } from "@/app/actions/vehicles"
import { toast } from "sonner"

interface VehicleTimelineEntry {
  id: string
  vin: string
  stock: string
  make: string
  model: string
  year: number
  inventoryDate: Date
  throughShop: boolean
  shopDoneDate?: Date
  detailComplete: boolean
  detailDoneDate?: Date
  photoComplete: boolean
  photoDoneDate?: Date
  salesReady: boolean
  salesReadyDate?: Date
  daysInInventory: number
  daysToShop?: number
  daysToDetail?: number
  daysToPhoto?: number
  daysToSalesReady?: number
}

export function VehicleTimeline() {
  const [vehicles, setVehicles] = useState<VehicleTimelineEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchVehicleTimeline()
  }, [])

  const fetchVehicleTimeline = async () => {
    setIsLoading(true)
    try {
      const data = await getVehicleTimeline()
      setVehicles(
        data.map((v) => ({
          ...v,
          inventoryDate: new Date(v.inventoryDate),
          shopDoneDate: v.shopDoneDate ? new Date(v.shopDoneDate) : undefined,
          detailDoneDate: v.detailDoneDate ? new Date(v.detailDoneDate) : undefined,
          photoDoneDate: v.photoDoneDate ? new Date(v.photoDoneDate) : undefined,
          salesReadyDate: v.salesReadyDate ? new Date(v.salesReadyDate) : undefined,
        })),
      )
    } catch (error) {
      console.error("Failed to fetch vehicle timeline:", error)
      toast.error("Failed to load vehicle timeline.")
    } finally {
      setIsLoading(false)
    }
  }

  const getStageStatus = (vehicle: VehicleTimelineEntry, stage: "shop" | "detail" | "photo" | "salesReady") => {
    switch (stage) {
      case "shop":
        return vehicle.throughShop ? "Completed" : "Pending"
      case "detail":
        return vehicle.detailComplete ? "Completed" : vehicle.throughShop ? "In Progress" : "Pending"
      case "photo":
        return vehicle.photoComplete ? "Completed" : vehicle.detailComplete ? "In Progress" : "Pending"
      case "salesReady":
        return vehicle.salesReady ? "Completed" : vehicle.photoComplete ? "In Progress" : "Pending"
      default:
        return "Unknown"
    }
  }

  const getStageDate = (vehicle: VehicleTimelineEntry, stage: "shop" | "detail" | "photo" | "salesReady") => {
    switch (stage) {
      case "shop":
        return vehicle.shopDoneDate
      case "detail":
        return vehicle.detailDoneDate
      case "photo":
        return vehicle.photoDoneDate
      case "salesReady":
        return vehicle.salesReadyDate
      default:
        return undefined
    }
  }

  const getDaysInStage = (vehicle: VehicleTimelineEntry, stage: "shop" | "detail" | "photo" | "salesReady") => {
    switch (stage) {
      case "shop":
        return vehicle.daysToShop
      case "detail":
        return vehicle.daysToDetail
      case "photo":
        return vehicle.daysToPhoto
      case "salesReady":
        return vehicle.daysToSalesReady
      default:
        return undefined
    }
  }

  const stages = ["shop", "detail", "photo", "salesReady"]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <p className="ml-4 text-gray-600">Loading vehicle timelines...</p>
      </div>
    )
  }

  if (vehicles.length === 0) {
    return (
      <div className="text-center py-12">
        <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-800">No Vehicles in Timeline</h3>
        <p className="text-gray-600 mt-2">Add vehicles to your inventory to see their reconditioning progress.</p>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vehicle Recon Timeline</CardTitle>
        <CardDescription>Track the progress of each vehicle through reconditioning stages.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {vehicles.map((vehicle) => (
          <div key={vehicle.id} className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">
                  {vehicle.year} {vehicle.make} {vehicle.model} ({vehicle.stock})
                </h3>
                <p className="text-sm text-muted-foreground">VIN: ...{vehicle.vin.slice(-6)}</p>
              </div>
              <Badge variant="secondary">Days in Inventory: {vehicle.daysInInventory}</Badge>
            </div>
            <Separator className="my-4" />
            <div className="relative pl-6">
              <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gray-200" />
              {stages.map((stage, index) => (
                <div key={stage} className="mb-6 relative">
                  <div className="absolute -left-3 top-0 flex items-center justify-center w-6 h-6 rounded-full bg-white border-2 border-blue-500">
                    {getStageStatus(vehicle, stage as any) === "Completed" ? (
                      <CheckCircle className="h-4 w-4 text-blue-500" />
                    ) : (
                      <Clock className="h-4 w-4 text-gray-500" />
                    )}
                  </div>
                  <div className="ml-4">
                    <h4 className="font-medium capitalize">{stage.replace(/([A-Z])/g, " $1").trim()}</h4>
                    <p className="text-sm text-muted-foreground">Status: {getStageStatus(vehicle, stage as any)}</p>
                    {getStageDate(vehicle, stage as any) && (
                      <p className="text-xs text-muted-foreground">
                        Completed: {getStageDate(vehicle, stage as any)?.toLocaleDateString()}
                      </p>
                    )}
                    {getDaysInStage(vehicle, stage as any) !== undefined && (
                      <p className="text-xs text-muted-foreground">
                        Days in Stage: {getDaysInStage(vehicle, stage as any)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
