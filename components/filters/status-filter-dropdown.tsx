"use client"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { ListFilter } from "lucide-react"
import { getVehicleStatuses } from "@/lib/data" // Assuming this utility exists

interface StatusFilterDropdownProps {
  currentStatus: string | undefined
  onStatusChange: (status: string | undefined) => void
}

export function StatusFilterDropdown({ currentStatus, onStatusChange }: StatusFilterDropdownProps) {
  const statuses = getVehicleStatuses()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-1 bg-transparent">
          <ListFilter className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Filter by Status</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onStatusChange(undefined)} className={!currentStatus ? "font-bold" : ""}>
          All
        </DropdownMenuItem>
        {statuses.map((status) => (
          <DropdownMenuItem
            key={status}
            onClick={() => onStatusChange(status)}
            className={currentStatus === status ? "font-bold" : ""}
          >
            {status.replace(/_/g, " ")}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
