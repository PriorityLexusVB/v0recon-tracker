"use client"

import { useVehicleStore } from "@/lib/vehicle-store"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, EyeOff } from "lucide-react"

export default function CompletedVehiclesToggle() {
  const { filters, setFilters, stats } = useVehicleStore()

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={filters.showCompleted ? "default" : "outline"}
        size="sm"
        onClick={() => setFilters({ showCompleted: !filters.showCompleted })}
        className="flex items-center gap-2"
      >
        {filters.showCompleted ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
        {filters.showCompleted ? "Hide" : "Show"} Completed
        <Badge variant="secondary" className="ml-1">
          {stats.completed}
        </Badge>
      </Button>
    </div>
  )
}
