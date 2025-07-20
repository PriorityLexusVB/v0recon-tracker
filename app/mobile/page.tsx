"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Car, Clock, CheckCircle, AlertTriangle, BarChart3, Bell, Menu, Search, Filter } from "lucide-react"

export default function MobilePage() {
  const [activeTab, setActiveTab] = useState("dashboard")

  const vehicles = [
    {
      id: "1",
      vin: "1HGBH41JXMN109186",
      make: "Honda",
      model: "Civic",
      year: 2021,
      status: "IN_PROGRESS",
      progress: 65,
      daysInRecon: 3,
      assignedTo: "Mike Johnson",
    },
    {
      id: "2",
      vin: "1FTFW1ET5DFC10312",
      make: "Ford",
      model: "F-150",
      year: 2020,
      status: "PENDING",
      progress: 0,
      daysInRecon: 1,
      assignedTo: null,
    },
    {
      id: "3",
      vin: "1G1YY22G965123456",
      make: "Chevrolet",
      model: "Camaro",
      year: 2019,
      status: "COMPLETED",
      progress: 100,
      daysInRecon: 7,
      assignedTo: "Sarah Wilson",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-500"
      case "IN_PROGRESS":
        return "bg-blue-500"
      case "PENDING":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "Completed"
      case "IN_PROGRESS":
        return "In Progress"
      case "PENDING":
        return "Pending"
      default:
        return status
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <header className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Menu className="h-6 w-6 text-gray-600" />
          <div className="flex items-center space-x-2">
            <Car className="h-6 w-6 text-blue-600" />
            <span className="font-bold text-gray-900">Recon Tracker</span>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Bell className="h-6 w-6 text-gray-600" />
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">JD</span>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active</p>
                  <p className="text-2xl font-bold">12</p>
                </div>
                <Car className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-2xl font-bold">8</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Days</p>
                  <p className="text-2xl font-bold">5.2</p>
                </div>
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Overdue</p>
                  <p className="text-2xl font-bold">3</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="px-4 pb-4">
        <div className="flex space-x-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search vehicles..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg bg-white"
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Vehicle List */}
      <div className="px-4 space-y-3">
        <h2 className="font-semibold text-gray-900">Recent Vehicles</h2>

        {vehicles.map((vehicle) => (
          <Card key={vehicle.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-semibold text-gray-900">
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </h3>
                    <Badge variant="secondary" className={`${getStatusColor(vehicle.status)} text-white text-xs`}>
                      {getStatusText(vehicle.status)}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">VIN: {vehicle.vin}</p>

                  {vehicle.status !== "PENDING" && (
                    <div className="mb-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>{vehicle.progress}%</span>
                      </div>
                      <Progress value={vehicle.progress} className="h-2" />
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>{vehicle.daysInRecon} days in recon</span>
                    {vehicle.assignedTo && <span>Assigned to {vehicle.assignedTo}</span>}
                  </div>
                </div>
              </div>

              <Button variant="outline" size="sm" className="w-full bg-transparent">
                View Details
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t">
        <div className="grid grid-cols-4 py-2">
          <button
            className={`flex flex-col items-center py-2 px-1 ${activeTab === "dashboard" ? "text-blue-600" : "text-gray-600"}`}
            onClick={() => setActiveTab("dashboard")}
          >
            <BarChart3 className="h-5 w-5 mb-1" />
            <span className="text-xs">Dashboard</span>
          </button>

          <button
            className={`flex flex-col items-center py-2 px-1 ${activeTab === "vehicles" ? "text-blue-600" : "text-gray-600"}`}
            onClick={() => setActiveTab("vehicles")}
          >
            <Car className="h-5 w-5 mb-1" />
            <span className="text-xs">Vehicles</span>
          </button>

          <button
            className={`flex flex-col items-center py-2 px-1 ${activeTab === "tasks" ? "text-blue-600" : "text-gray-600"}`}
            onClick={() => setActiveTab("tasks")}
          >
            <CheckCircle className="h-5 w-5 mb-1" />
            <span className="text-xs">Tasks</span>
          </button>

          <button
            className={`flex flex-col items-center py-2 px-1 ${activeTab === "alerts" ? "text-blue-600" : "text-gray-600"}`}
            onClick={() => setActiveTab("alerts")}
          >
            <Bell className="h-5 w-5 mb-1" />
            <span className="text-xs">Alerts</span>
          </button>
        </div>
      </div>

      {/* Bottom padding to account for fixed navigation */}
      <div className="h-20"></div>
    </div>
  )
}
