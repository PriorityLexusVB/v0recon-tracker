"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle } from "lucide-react"
import type { VehicleWithRelations } from "@/lib/vehicle-store" // Assuming this type is defined
import { format } from "date-fns"

interface CompletedVehiclesPanelProps {
  vehicles: VehicleWithRelations[]
  loading: boolean
  error: string | null
}

export function CompletedVehiclesPanel({ vehicles, loading, error }: CompletedVehiclesPanelProps) {
  if (loading) {
    return (
      <Card className="h-[400px] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-2">Loading completed vehicles...</p>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="h-[400px] flex items-center justify-center">
        <p className="text-red-600">{error}</p>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-500" /> Recently Completed Vehicles
        </CardTitle>
        <CardDescription>Overview of vehicles that have finished reconditioning.</CardDescription>
      </CardHeader>
      <CardContent>
        {vehicles.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No vehicles completed recently.</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>VIN</TableHead>
                  <TableHead>Make/Model</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Days in Recon</TableHead>
                  <TableHead>Completed On</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vehicles.map((vehicle) => (
                  <TableRow key={vehicle.id}>
                    <TableCell className="font-medium">{vehicle.vin}</TableCell>
                    <TableCell>
                      {vehicle.make} {vehicle.model}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        {vehicle.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{vehicle.daysInRecon} days</TableCell>
                    <TableCell>{format(new Date(vehicle.lastUpdated), "MMM dd, yyyy")}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
