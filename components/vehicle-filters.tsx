"use client"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Search, XCircle } from "lucide-react"
import { useState, useEffect } from "react"
import { useDebounce } from "@/hooks/use-debounce"
import type { FilterState } from "@/lib/types"

interface VehicleFiltersProps {
  filters: FilterState
  setFilters: (filters: Partial<FilterState>) => void
  onApplyFilters: () => void
  onClearFilters: () => void
}

export function VehicleFilters({ filters, setFilters, onApplyFilters, onClearFilters }: VehicleFiltersProps) {
  const [localSearch, setLocalSearch] = useState(filters.search)
  const debouncedSearch = useDebounce(localSearch, 500)

  useEffect(() => {
    setFilters({ search: debouncedSearch })
  }, [debouncedSearch, setFilters])

  const handleStatusChange = (value: string) => {
    setFilters({ status: value })
    onApplyFilters()
  }

  const handleClear = () => {
    setLocalSearch("")
    setFilters({ search: "", status: "ALL", activeStatFilter: undefined })
    onClearFilters()
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 p-4 bg-card rounded-lg shadow-sm">
      <div className="relative flex-grow">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search VIN, Make, Model, Stock #"
          className="pl-9 pr-4 py-2 w-full"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
        />
      </div>

      <Select value={filters.status} onValueChange={handleStatusChange}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Filter by Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All Statuses</SelectItem>
          <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
          <SelectItem value="COMPLETED">Completed</SelectItem>
          <SelectItem value="ON_HOLD">On Hold</SelectItem>
          <SelectItem value="CANCELED">Canceled</SelectItem>
          <SelectItem value="PENDING_INSPECTION">Pending Inspection</SelectItem>
          <SelectItem value="AWAITING_PARTS">Awaiting Parts</SelectItem>
          <SelectItem value="READY_FOR_SALE">Ready for Sale</SelectItem>
        </SelectContent>
      </Select>

      <Button variant="outline" onClick={handleClear} className="w-full sm:w-auto bg-transparent">
        <XCircle className="mr-2 h-4 w-4" />
        Clear Filters
      </Button>
    </div>
  )
}
