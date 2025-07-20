"use client"

import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Car, Clock, CheckCircle, AlertTriangle, Filter } from "lucide-react"

const vehicles = [
  {
    id: "1",
    vin: "1HGBH41JXMN109186",
    make: "Honda",
    model: "Civic",
    year: 2021,
    status: "IN_PROGRESS",
    progress: 75,
    assignedTo: "John Smith",
    daysInRecon: 3,
    priority: "HIGH",
  },
  {
    id: "2",
    vin: "1FTFW1ET5DFC10312",
    make: "Ford",
    model: "F-150",
    year: 2020,
    status: "PENDING",
    progress: 0,
    assignedTo: null,
    daysInRecon: 1,
    priority: "NORMAL",
  },
  {
    id: "3",
    vin: "1G1ZD5ST8JF123456",
    make: "Chevrolet",
    model: "Malibu",
    year: 2019,
    status: "COMPLETED",
    progress: 100,
    assignedTo: "Sarah Johnson",
    daysInRecon: 5,
    priority: "LOW",
  },
]

export default function ReconCardsPage() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return <div className="container mx-auto py-8">Loading...</div>
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800"
      case "IN_PROGRESS":
        return "bg-yellow-100 text-yellow-800"
      case "PENDING":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "bg-red-100 text-red-800"
      case "NORMAL":
        return "bg-blue-100 text-blue-800"
      case "LOW":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle className="h-4 w-4" />
      case "IN_PROGRESS":
        return <Clock className="h-4 w-4" />
      case "PENDING":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <Car className="h-4 w-4" />
    }
  }

  const stats = {
    total: vehicles.length,
    completed: vehicles.filter((v) => v.status === "COMPLETED").length,
    inProgress: vehicles.filter((v) => v.status === "IN_PROGRESS").length,
    pending: vehicles.filter((v) => v.status === "PENDING").length,
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Recon Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.name}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button>
            <Car className="mr-2 h-4 w-4" />
            Add Vehicle
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vehicles</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">In recon process</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">Ready for sale</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.inProgress}</div>
            <p className="text-xs text-muted-foreground">Being worked on</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Awaiting assignment</p>
          </CardContent>
        </Card>
      </div>

      {/* Vehicle Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vehicles.map((vehicle) => (
          <Card key={vehicle.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </CardTitle>
                  <p className="text-sm text-gray-500 font-mono mt-1">{vehicle.vin}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <Badge className={getStatusColor(vehicle.status)}>
                    {getStatusIcon(vehicle.status)}
                    <span className="ml-1">{vehicle.status.replace("_", " ")}</span>
                  </Badge>
                  <Badge className={getPriorityColor(vehicle.priority)}>{vehicle.priority}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {vehicle.status !== "PENDING" && (
                  <div>
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                      <span>Progress</span>
                      <span>{vehicle.progress}%</span>
                    </div>
                    <Progress value={vehicle.progress} className="h-2" />
                  </div>
                )}

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Days in Recon:</span>
                  <span className="font-medium">{vehicle.daysInRecon}</span>
                </div>

                {vehicle.assignedTo && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Assigned to:</span>
                    <span className="font-medium">{vehicle.assignedTo}</span>
                  </div>
                )}

                <div className="flex justify-end space-x-2 pt-2">
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                  <Button size="sm">Update Status</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
