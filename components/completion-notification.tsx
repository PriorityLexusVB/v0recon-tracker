"use client"

import { useEffect } from "react"
import { toast } from "sonner"
import { useCelebration } from "@/hooks/use-celebration" // Assuming this hook exists

interface CompletionNotificationProps {
  vehicleVin: string
  vehicleMake: string
  vehicleModel: string
  onClose?: () => void
}

export function CompletionNotification({
  vehicleVin,
  vehicleMake,
  vehicleModel,
  onClose,
}: CompletionNotificationProps) {
  const { triggerCelebration } = useCelebration()

  useEffect(() => {
    toast.success(`Vehicle Completed!`, {
      description: `${vehicleMake} ${vehicleModel} (VIN: ${vehicleVin}) has finished reconditioning!`,
      duration: 5000, // Display for 5 seconds
      action: {
        label: "View",
        onClick: () => {
          // Navigate to vehicle details page or dashboard
          console.log(`Viewing vehicle ${vehicleVin}`)
          if (onClose) onClose()
        },
      },
      onDismiss: () => {
        if (onClose) onClose()
      },
      onAutoClose: () => {
        if (onClose) onClose()
      },
    })
    triggerCelebration() // Trigger confetti or other celebration
  }, [vehicleVin, vehicleMake, vehicleModel, onClose, triggerCelebration])

  return null // This component doesn't render anything visible itself
}
