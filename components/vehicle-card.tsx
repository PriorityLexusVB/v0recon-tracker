"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar, Clock, User, Users } from "lucide-react"
import type { Vehicle } from "@/lib/types"
import { useAuth } from "@/hooks/use-auth"

interface VehicleCardProps {
  vehicle: Vehicle
  onUpdate?: (vin: string, field: string, value: boolean) => void
}

export default function VehicleCard({ vehicle, onUpdate }: VehicleCardProps) {
  const { user } = useAuth()
  const [isUpdating, setIsUpdating] = useState(false)

  const canEditShop = user?.department === "shop" || user?.role === "admin" || user?.role === "manager"
  const canEditDetail = user?.department === "detail" || user?.role === "admin" || user?.role === "manager"
  const canEditPhoto = user?.department === "photo" || user?.role === "admin" || user?.role === "manager"

  const handleCheckboxChange = async (field: string, checked: boolean) => {
    if (!onUpdate) return

    setIsUpdating(true)
    try {
      await onUpdate(vehicle.vin, field, checked)
    } finally {
      setIsUpdating(false)
    }
  }

  const isOverdue = (dateString?: string) => {
    if (!dateString) return false
    const date = new Date(dateString)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date < today
  }

  const getDaysOverdue = (dateString?: string) => {
    if (!dateString) return 0
    const date = new Date(dateString)
    const today = new Date()
    const diffTime = today.getTime() - date.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const getPriorityBadgeColor = (priority?: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800"
      case "high":
        return "bg-orange-100 text-orange-800"
      case "normal":
        return "bg-blue-100 text-blue-800"
      case "low":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            {vehicle.year} {vehicle.make} {vehicle.model}
          </CardTitle>
          {vehicle.priority && <Badge className={getPriorityBadgeColor(vehicle.priority)}>{vehicle.priority}</Badge>}
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span className="font-mono">{vehicle.vin}</span>
          <span>Stock: {vehicle.stock}</span>
        </div>
        {vehicle.assignedTeam && (
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4" />
            <span>Team: {vehicle.assignedTeam}</span>
            {vehicle.assignedUser && (
              <>
                <User className="h-4 w-4 ml-2" />
                <span>{vehicle.assignedUser}</span>
              </>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Inventory Date */}
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4" />
          <span>Inventory: {new Date(vehicle.inventoryDate).toLocaleDateString()}</span>
        </div>

        {/* Due Date */}
        {vehicle.dueDate && (
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4" />
            <span className={isOverdue(vehicle.dueDate) ? "text-red-600 font-medium" : ""}>
              Due: {new Date(vehicle.dueDate).toLocaleDateString()}
              {isOverdue(vehicle.dueDate) && (
                <span className="ml-2 text-red-600">({getDaysOverdue(vehicle.dueDate)} days overdue)</span>
              )}
            </span>
          </div>
        )}

        {/* Progress Checkboxes */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id={`shop-${vehicle.vin}`}
              checked={vehicle.throughShop}
              disabled={!canEditShop || isUpdating}
              onCheckedChange={(checked) => handleCheckboxChange("throughShop", checked as boolean)}
            />
            <label
              htmlFor={`shop-${vehicle.vin}`}
              className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${
                !canEditShop ? "text-gray-500" : ""
              }`}
            >
              Through Shop {!canEditShop && "(shop only)"}
              {vehicle.shopDone && (
                <span className="ml-2 text-xs text-green-600">✓ {new Date(vehicle.shopDone).toLocaleDateString()}</span>
              )}
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id={`detail-${vehicle.vin}`}
              checked={vehicle.detailComplete}
              disabled={!canEditDetail || isUpdating}
              onCheckedChange={(checked) => handleCheckboxChange("detailComplete", checked as boolean)}
            />
            <label
              htmlFor={`detail-${vehicle.vin}`}
              className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${
                !canEditDetail ? "text-gray-500" : ""
              }`}
            >
              Detail Complete {!canEditDetail && "(detail only)"}
              {vehicle.detailDone && (
                <span className="ml-2 text-xs text-green-600">
                  ✓ {new Date(vehicle.detailDone).toLocaleDateString()}
                </span>
              )}
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id={`photo-${vehicle.vin}`}
              checked={vehicle.photoComplete}
              disabled={!canEditPhoto || isUpdating}
              onCheckedChange={(checked) => handleCheckboxChange("photoComplete", checked as boolean)}
            />
            <label
              htmlFor={`photo-${vehicle.vin}`}
              className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${
                !canEditPhoto ? "text-gray-500" : ""
              }`}
            >
              Photo Complete {!canEditPhoto && "(photo only)"}
              {vehicle.photoDone && (
                <span className="ml-2 text-xs text-green-600">
                  ✓ {new Date(vehicle.photoDone).toLocaleDateString()}
                </span>
              )}
            </label>
          </div>
        </div>

        {/* Notes */}
        {vehicle.notes && (
          <div className="mt-4 p-3 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-700">{vehicle.notes}</p>
          </div>
        )}

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Progress</span>
            <span>{[vehicle.throughShop, vehicle.detailComplete, vehicle.photoComplete].filter(Boolean).length}/3</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${
                  ([vehicle.throughShop, vehicle.detailComplete, vehicle.photoComplete].filter(Boolean).length / 3) *
                  100
                }%`,
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
