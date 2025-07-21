"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle } from "lucide-react"
import { toast } from "sonner"
import { updateVehicleStatus } from "@/app/actions/vehicles"
import { Loader2 } from "lucide-react" // Import Loader2

interface CompletedVehiclesToggleProps {
  vehicleId: string
  initialStatus: boolean
  onStatusChange?: (newStatus: boolean) => void
}

export function CompletedVehiclesToggle({ vehicleId, initialStatus, onStatusChange }: CompletedVehiclesToggleProps) {
  const [isCompleted, setIsCompleted] = useState(initialStatus)
  const [isLoading, setIsLoading] = useState(false)

  const handleToggle = async () => {
    setIsLoading(true)
    const newStatus = !isCompleted
    try {
      const result = await updateVehicleStatus(vehicleId, newStatus ? "COMPLETED" : "SALES_READY")
      if (result.success) {
        setIsCompleted(newStatus)
        onStatusChange?.(newStatus)
        toast.success(`Vehicle marked as ${newStatus ? "completed" : "sales ready"}.`)
      } else {
        toast.error(result.message || "Failed to update vehicle status.")
      }
    } catch (error) {
      console.error("Error updating vehicle status:", error)
      toast.error("An unexpected error occurred.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant={isCompleted ? "default" : "outline"}
      onClick={handleToggle}
      disabled={isLoading}
      className="w-full"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isCompleted ? (
        <>
          <CheckCircle className="mr-2 h-4 w-4" /> Marked Completed
        </>
      ) : (
        <>
          <XCircle className="mr-2 h-4 w-4" /> Mark as Completed
        </>
      )}
    </Button>
  )
}
