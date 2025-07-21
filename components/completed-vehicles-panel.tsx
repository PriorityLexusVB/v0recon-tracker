"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ArrowRight, Loader2, Car, CheckCircle } from "lucide-react"
import Link from "next/link"
import { getCompletedVehicles } from "@/app/actions/vehicles"
import { toast } from "sonner"

interface Vehicle {
  id: string
  vin: string
  stock: string
  make: string
  model: string
  year: number
  completedAt?: Date
}

export function CompletedVehiclesPanel() {
  const [completedVehicles, setCompletedVehicles] = useState<Vehicle[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchCompletedVehicles()
  }, [])

  const fetchCompletedVehicles = async () => {
    setIsLoading(true)
    try {
      const data = await getCompletedVehicles()
      setCompletedVehicles(data)
    } catch (error) {
      console.error("Failed to fetch completed vehicles:", error)
      toast.error("Failed to load completed vehicles.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-lg">Completed Vehicles</CardTitle>
          <CardDescription>Recently finished reconditioning process</CardDescription>
        </div>
        <CheckCircle className="h-5 w-5 text-green-500" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
            <p className="ml-2 text-gray-600">Loading...</p>
          </div>
        ) : completedVehicles.length === 0 ? (
          <div className="text-center py-8">
            <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No vehicles completed recently.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>VIN</TableHead>
                  <TableHead>Completed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {completedVehicles.slice(0, 5).map((vehicle) => (
                  <TableRow key={vehicle.id}>
                    <TableCell className="font-medium">
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </TableCell>
                    <TableCell>{vehicle.vin.slice(-6)}</TableCell>
                    <TableCell>
                      {vehicle.completedAt ? new Date(vehicle.completedAt).toLocaleDateString() : "N/A"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        <div className="mt-4 text-right">
          <Button variant="link" asChild>
            <Link href="/recon/cards?status=completed">
              View All Completed <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
