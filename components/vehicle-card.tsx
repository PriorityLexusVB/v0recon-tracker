"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Car, Clock, MapPin, DollarSign, User, CalendarDays, Tag, Gauge } from "lucide-react"
import Link from "next/link"
import type { Vehicle } from "@/lib/types" // Assuming Vehicle type is defined in lib/types.ts

interface VehicleCardProps {
  vehicle: Vehicle
}

export function VehicleCard({ vehicle }: VehicleCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-500 hover:bg-green-600"
      case "IN_PROGRESS":
        return "bg-blue-500 hover:bg-blue-600"
      case "ON_HOLD":
        return "bg-yellow-500 hover:bg-yellow-600"
      case "CANCELED":
        return "bg-red-500 hover:bg-red-600"
      case "PENDING_INSPECTION":
        return "bg-purple-500 hover:bg-purple-600"
      case "AWAITING_PARTS":
        return "bg-orange-500 hover:bg-orange-600"
      case "READY_FOR_SALE":
        return "bg-teal-500 hover:bg-teal-600"
      default:
        return "bg-gray-500 hover:bg-gray-600"
    }
  }

  const getProgressValue = (status: string) => {
    switch (status) {
      case "PENDING_INSPECTION":
        return 10
      case "IN_PROGRESS":
        return 40
      case "AWAITING_PARTS":
        return 60
      case "READY_FOR_SALE":
        return 80
      case "COMPLETED":
        return 100
      default:
        return 0
    }
  }

  return (
    <Card className="w-full shadow-md hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl flex items-center gap-2">
            <Car className="h-5 w-5 text-muted-foreground" />
            {vehicle.year} {vehicle.make} {vehicle.model}
          </CardTitle>
          <Badge className={getStatusColor(vehicle.status)}>{vehicle.status.replace(/_/g, " ")}</Badge>
        </div>
        <CardDescription className="flex items-center gap-1 text-sm">
          <Tag className="h-4 w-4 text-muted-foreground" />
          VIN: {vehicle.vin} | Stock #: {vehicle.stockNumber}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">Location:</span> {vehicle.currentLocation || "N/A"}
        </div>
        <div className="flex items-center gap-2 text-sm">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">Assigned To:</span> {vehicle.assignedTo?.name || "Unassigned"}
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">Days in Recon:</span> {vehicle.daysInRecon}
        </div>
        {vehicle.mileage !== null && vehicle.mileage !== undefined && (
          <div className="flex items-center gap-2 text-sm">
            <Gauge className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Mileage:</span> {vehicle.mileage.toLocaleString()}
          </div>
        )}
        {vehicle.reconditioningCost !== null && vehicle.reconditioningCost !== undefined && (
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Recon Cost:</span> ${vehicle.reconditioningCost.toFixed(2)}
          </div>
        )}
        <div className="flex items-center gap-2 text-sm">
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">Last Updated:</span> {new Date(vehicle.lastUpdated).toLocaleDateString()}
        </div>
        <div className="mt-2">
          <Progress value={getProgressValue(vehicle.status)} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">Recon Progress</p>
        </div>
        <Link href={`/recon/cards/${vehicle.id}`} passHref>
          <Button variant="outline" className="w-full mt-4 bg-transparent">
            View Details
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
