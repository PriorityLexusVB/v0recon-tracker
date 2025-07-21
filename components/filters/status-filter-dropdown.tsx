"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface StatusFilterDropdownProps {
  value: string
  onValueChange: (value: string) => void
}

export function StatusFilterDropdown({ value, onValueChange }: StatusFilterDropdownProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Filter by Status" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Statuses</SelectItem>
        <SelectItem value="PENDING">Pending</SelectItem>
        <SelectItem value="IN_SHOP">In Shop</SelectItem>
        <SelectItem value="DETAIL">Detail</SelectItem>
        <SelectItem value="PHOTO">Photo</SelectItem>
        <SelectItem value="SALES_READY">Sales Ready</SelectItem>
        <SelectItem value="COMPLETED">Completed</SelectItem>
      </SelectContent>
    </Select>
  )
}
