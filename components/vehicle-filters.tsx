"use client"

import { useVehicleStore } from "@/lib/store"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function VehicleFilters() {
  const { filters, setFilters } = useVehicleStore()

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder="Search by VIN, Stock, Make, or Model..."
          value={filters.search}
          onChange={(e) => setFilters({ search: e.target.value })}
          className="pl-10"
        />
      </div>

      {/* Status Filter */}
      <div className="w-full sm:w-48">
        <Select
          value={filters.status}
          onValueChange={(value: "all" | "pending" | "completed" | "overdue") =>
            setFilters({ status: value, activeStatFilter: undefined })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Vehicles</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
