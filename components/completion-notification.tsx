"use client"

import { useEffect } from "react"
import confetti from "canvas-confetti"
import { toast } from "sonner"

interface CompletionNotificationProps {
  show: boolean
  message: string
  onClose: () => void
}

export function CompletionNotification({ show, message, onClose }: CompletionNotificationProps) {
  useEffect(() => {
    if (show) {
      toast.success(message, {
        duration: 5000,
        onAutoClose: onClose,
        action: {
          label: "Dismiss",
          onClick: onClose,
        },
      })

      // Trigger confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      })
    }
  }, [show, message, onClose])

  return null // This component doesn't render anything directly
}
