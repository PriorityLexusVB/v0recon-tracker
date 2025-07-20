"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, AlertTriangle, CheckCircle, Car, ArrowRight } from "lucide-react"
import { formatDate, daysSince } from "@/lib/utils"
import type { Vehicle } from "@/lib/types"

interface TimelineStep {
  name: string
  status: "completed" | "current" | "pending" | "overdue"
  startDate?: string
  endDate?: string
  duration?: number
  isBottleneck?: boolean
}

interface VehicleTimelineProps {
  vehicle: Vehicle
  onClose?: () => void
}

export default function VehicleTimeline({ vehicle, onClose }: VehicleTimelineProps) {
  const [showDetails, setShowDetails] = useState(false)

  // Calculate timeline steps
  const inventoryDate = vehicle.inventoryDate
  const shopDate = vehicle.shopDone
  const detailDate = vehicle.detailDone
  const photoDate = vehicle.photoDone

  // Estimate front line date (typically 1-2 days after photo completion)
  const frontLineDate = photoDate
    ? new Date(new Date(photoDate).getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
    : undefined

  const steps: TimelineStep[] = [
    {
      name: "Inventory",
      status: "completed",
      startDate: inventoryDate,
      endDate: inventoryDate,
      duration: 0,
    },
    {
      name: "Shop Work",
      status: vehicle.throughShop ? "completed" : daysSince(inventoryDate) > 5 ? "overdue" : "current",
      startDate: inventoryDate,
      endDate: shopDate,
      duration: shopDate ? daysSince(inventoryDate, shopDate) : daysSince(inventoryDate),
      isBottleneck: !vehicle.throughShop && daysSince(inventoryDate) > 7,
    },
    {
      name: "Detail",
      status: vehicle.detailComplete
        ? "completed"
        : !vehicle.throughShop
          ? "pending"
          : daysSince(shopDate || inventoryDate) > 3
            ? "overdue"
            : "current",
      startDate: shopDate || inventoryDate,
      endDate: detailDate,
      duration: detailDate
        ? daysSince(shopDate || inventoryDate, detailDate)
        : vehicle.throughShop
          ? daysSince(shopDate || inventoryDate)
          : 0,
      isBottleneck: vehicle.throughShop && !vehicle.detailComplete && daysSince(shopDate || inventoryDate) > 5,
    },
    {
      name: "Photo",
      status: vehicle.photoComplete
        ? "completed"
        : !vehicle.detailComplete
          ? "pending"
          : daysSince(detailDate || shopDate || inventoryDate) > 2
            ? "overdue"
            : "current",
      startDate: detailDate || shopDate || inventoryDate,
      endDate: photoDate,
      duration: photoDate
        ? daysSince(detailDate || shopDate || inventoryDate, photoDate)
        : vehicle.detailComplete
          ? daysSince(detailDate || shopDate || inventoryDate)
          : 0,
      isBottleneck:
        vehicle.detailComplete && !vehicle.photoComplete && daysSince(detailDate || shopDate || inventoryDate) > 3,
    },
    {
      name: "Front Line Ready",
      status: vehicle.photoComplete ? "completed" : "pending",
      startDate: photoDate,
      endDate: frontLineDate,
      duration: frontLineDate && photoDate ? daysSince(photoDate, frontLineDate) : 0,
    },
  ]

  const totalDuration = vehicle.photoComplete ? daysSince(inventoryDate, photoDate) : daysSince(inventoryDate)

  const getStepColor = (status: string, isBottleneck?: boolean) => {
    if (isBottleneck) return "border-red-500 bg-red-50"
    switch (status) {
      case "completed":
        return "border-green-500 bg-green-50"
      case "current":
        return "border-blue-500 bg-blue-50"
      case "overdue":
        return "border-red-500 bg-red-50"
      case "pending":
        return "border-gray-300 bg-gray-50"
      default:
        return "border-gray-300 bg-gray-50"
    }
  }

  const getStepIcon = (status: string, isBottleneck?: boolean) => {
    if (isBottleneck) return <AlertTriangle className="h-4 w-4 text-red-600" />
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "current":
        return <Clock className="h-4 w-4 text-blue-600" />
      case "overdue":
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      case "pending":
        return <Clock className="h-4 w-4 text-gray-400" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusBadge = (status: string, isBottleneck?: boolean) => {
    if (isBottleneck) return <Badge variant="destructive">Bottleneck</Badge>
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Complete</Badge>
      case "current":
        return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>
      case "overdue":
        return <Badge variant="destructive">Overdue</Badge>
      case "pending":
        return <Badge variant="secondary">Pending</Badge>
      default:
        return <Badge variant="secondary">Pending</Badge>
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Car className="h-6 w-6 text-blue-600" />
            <div>
              <CardTitle className="text-xl">
                {vehicle.year} {vehicle.make} {vehicle.model}
              </CardTitle>
              <p className="text-sm text-gray-500">
                Stock: {vehicle.stock} • VIN: {vehicle.vin}
              </p>
            </div>
          </div>
          {onClose && (
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
          )}
        </div>

        <div className="flex items-center gap-4 mt-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">Started: {formatDate(inventoryDate)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">Total Time: {totalDuration} days</span>
          </div>
          {vehicle.photoComplete && <Badge className="bg-green-100 text-green-800">Ready for Front Line</Badge>}
        </div>
      </CardHeader>

      <CardContent>
        {/* Timeline Visualization */}
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div key={step.name} className="relative">
              {/* Connection Line */}
              {index < steps.length - 1 && <div className="absolute left-6 top-12 w-0.5 h-8 bg-gray-300"></div>}

              <div
                className={`flex items-start gap-4 p-4 rounded-lg border-2 ${getStepColor(step.status, step.isBottleneck)}`}
              >
                {/* Step Icon */}
                <div className="flex-shrink-0 mt-1">{getStepIcon(step.status, step.isBottleneck)}</div>

                {/* Step Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-lg">{step.name}</h3>
                    {getStatusBadge(step.status, step.isBottleneck)}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500 mb-1">Start Date</p>
                      <p className="font-medium">{step.startDate ? formatDate(step.startDate) : "Not started"}</p>
                    </div>

                    <div>
                      <p className="text-gray-500 mb-1">End Date</p>
                      <p className="font-medium">
                        {step.endDate
                          ? formatDate(step.endDate)
                          : step.status === "pending"
                            ? "Waiting"
                            : "In progress"}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-500 mb-1">Duration</p>
                      <p className="font-medium">{step.duration !== undefined ? `${step.duration} days` : "—"}</p>
                    </div>
                  </div>

                  {/* Bottleneck Warning */}
                  {step.isBottleneck && (
                    <div className="mt-3 p-2 bg-red-100 rounded-md">
                      <p className="text-sm text-red-800 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        This step is taking longer than expected and may be causing delays
                      </p>
                    </div>
                  )}
                </div>

                {/* Arrow for flow */}
                {index < steps.length - 1 && step.status === "completed" && (
                  <div className="flex-shrink-0 mt-6">
                    <ArrowRight className="h-5 w-5 text-green-600" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold mb-3">Timeline Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Shop Duration</p>
              <p className="font-semibold text-lg">{steps[1].duration || 0} days</p>
            </div>
            <div>
              <p className="text-gray-500">Detail Duration</p>
              <p className="font-semibold text-lg">{steps[2].duration || 0} days</p>
            </div>
            <div>
              <p className="text-gray-500">Photo Duration</p>
              <p className="font-semibold text-lg">{steps[3].duration || 0} days</p>
            </div>
            <div>
              <p className="text-gray-500">Total Time</p>
              <p className="font-semibold text-lg text-blue-600">{totalDuration} days</p>
            </div>
          </div>
        </div>

        {/* Performance Indicators */}
        <div className="mt-4 flex flex-wrap gap-2">
          {totalDuration <= 10 && <Badge className="bg-green-100 text-green-800">Fast Track</Badge>}
          {totalDuration > 15 && <Badge variant="destructive">Slow Processing</Badge>}
          {steps.some((s) => s.isBottleneck) && <Badge variant="destructive">Has Bottlenecks</Badge>}
          {vehicle.photoComplete && <Badge className="bg-blue-100 text-blue-800">Complete</Badge>}
        </div>
      </CardContent>
    </Card>
  )
}
