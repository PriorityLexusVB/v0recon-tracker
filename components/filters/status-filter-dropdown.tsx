"use client"

import { useVehicleStore } from "@/lib/vehicle-store"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function StatusFilterDropdown() {
  const { filters, setFilters } = useVehicleStore()

  return (
    <div className="w-full sm:w-48">
      <Select
        value={filters.status}
        onValueChange={(value: "all" | "complete" | "needs-attention" | "overdue") =>
          setFilters({ status: value, activeStatFilter: undefined })
        }
      >
        <SelectTrigger>
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="complete">Complete</SelectItem>
          <SelectItem value="needs-attention">Needs Attention</SelectItem>
          <SelectItem value="overdue">Overdue</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
