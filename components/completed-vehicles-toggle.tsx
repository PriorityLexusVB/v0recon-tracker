"use client"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useVehicleStore } from "@/lib/vehicle-store" // Assuming a Zustand store for global state

export function CompletedVehiclesToggle() {
  const { showCompleted, toggleShowCompleted, isLoading } = useVehicleStore()

  const handleToggle = () => {
    toggleShowCompleted()
    toast.info(showCompleted ? "Hiding completed vehicles." : "Showing completed vehicles.")
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleToggle}
      disabled={isLoading}
      className="flex items-center gap-2 bg-transparent"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : showCompleted ? (
        <EyeOff className="h-4 w-4" />
      ) : (
        <Eye className="h-4 w-4" />
      )}
      <span>{showCompleted ? "Hide Completed" : "Show Completed"}</span>
    </Button>
  )
}
