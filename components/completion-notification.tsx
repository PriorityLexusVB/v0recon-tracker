"use client"

import { useEffect, useState } from "react"
import { CheckCircle, Sparkles, Trophy } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Vehicle } from "@/lib/types"

interface CompletionNotificationProps {
  vehicle: Vehicle | null
  onClose: () => void
}

export default function CompletionNotification({ vehicle, onClose }: CompletionNotificationProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    if (vehicle) {
      setIsVisible(true)
      setIsExiting(false)

      // Auto-close after 4 seconds
      const timer = setTimeout(() => {
        handleClose()
      }, 4000)

      return () => clearTimeout(timer)
    }
  }, [vehicle])

  const handleClose = () => {
    setIsExiting(true)
    setTimeout(() => {
      setIsVisible(false)
      onClose()
    }, 300)
  }

  if (!vehicle || !isVisible) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-start justify-center pt-20">
      <Card
        className={`pointer-events-auto max-w-md mx-4 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 shadow-xl transition-all duration-300 ${
          isExiting ? "transform scale-95 opacity-0 translate-y-2" : "transform scale-100 opacity-100 translate-y-0"
        }`}
        onClick={handleClose}
      >
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="relative">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-yellow-500 animate-pulse" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="h-5 w-5 text-yellow-600" />
                <h3 className="text-lg font-semibold text-green-800">Vehicle Completed! 🎉</h3>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-900">
                  {vehicle.year} {vehicle.make} {vehicle.model}
                </p>

                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    Stock: {vehicle.stock}
                  </Badge>
                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                    All Steps Complete
                  </Badge>
                </div>

                <div className="flex items-center gap-4 text-xs text-gray-600 mt-3">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Shop ✓</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Detail ✓</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Photo ✓</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">Vehicle moved to completed archive • Click to dismiss</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
