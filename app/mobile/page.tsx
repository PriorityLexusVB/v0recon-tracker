"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Car, Scan, CheckCircle, Clock, MapPin, User, DollarSign, Search } from "lucide-react"
import { toast } from "sonner"
import { fetchVehicleByVin, updateVehicleStatus, addTimelineEvent } from "@/app/actions/vehicles"
import type { Vehicle } from "@/lib/types" // Assuming these types are defined

export default function MobileReconPage() {
  const [vin, setVin] = useState("")
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [eventDescription, setEventDescription] = useState("")
  const [currentDepartment, setCurrentDepartment] = useState("")

  const handleVinSearch = async () => {
    if (!vin) {
      toast.error("Please enter a VIN.")
      return
    }
    setLoading(true)
    setError(null)
    setVehicle(null)
    try {
      const result = await fetchVehicleByVin(vin)
      if (result.success && result.vehicle) {
        setVehicle(result.vehicle)
        setCurrentDepartment(result.vehicle.currentLocation || "") // Set current department from vehicle data
      } else {
        setError(result.message || "Vehicle not found or an error occurred.")
        toast.error(result.message || "Vehicle not found.")
      }
    } catch (err) {
      setError("An unexpected error occurred while fetching vehicle.")
      toast.error("An unexpected error occurred while fetching vehicle.")
      console.error("Error fetching vehicle:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (newStatus: string) => {
    if (!vehicle) return

    setLoading(true)
    try {
      const result = await updateVehicleStatus(vehicle.id, newStatus)
      if (result.success && result.vehicle) {
        toast.success(`Vehicle status updated to ${newStatus}.`)
        setVehicle(result.vehicle) // Update local state with the latest vehicle data
      } else {
        toast.error(result.message || "Failed to update vehicle status.")
      }
    } catch (err) {
      toast.error("Failed to update vehicle status.")
      console.error("Error updating status:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddEvent = async (eventType: string) => {
    if (!vehicle) return

    setLoading(true)
    try {
      const result = await addTimelineEvent({
        vehicleId: vehicle.id,
        eventType: eventType,
        description: eventDescription,
        department: currentDepartment || undefined, // Only include if set
        userId: undefined, // In a real app, get current user ID from session
      })
      if (result.success) {
        toast.success("Timeline event added.")
        setEventDescription("")
        // Refresh vehicle data to show new timeline event
        const updatedVehicleResult = await fetchVehicleByVin(vin)
        if (updatedVehicleResult.success && updatedVehicleResult.vehicle) {
          setVehicle(updatedVehicleResult.vehicle)
        }
      } else {
        toast.error(result.message || "Failed to add timeline event.")
      }
    } catch (err) {
      toast.error("Failed to add timeline event.")
      console.error("Error adding event:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Mobile Recon Tracker</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scan className="h-5 w-5" /> VIN Search
          </CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Input
            placeholder="Enter VIN"
            value={vin}
            onChange={(e) => setVin(e.target.value.toUpperCase())}
            className="flex-grow"
            disabled={loading}
          />
          <Button onClick={handleVinSearch} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            <span className="sr-only">Search</span>
          </Button>
        </CardContent>
      </Card>

      {error && <p className="text-red-500 text-center mb-4">{error}</p>}

      {vehicle && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5" /> Vehicle Details
            </CardTitle>
            <p className="text-sm text-gray-500">{vehicle.vin}</p>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>
              <strong>
                {vehicle.year} {vehicle.make} {vehicle.model}
              </strong>{" "}
              {vehicle.trim}
            </p>
            <p className="flex items-center gap-1 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              Location: {vehicle.currentLocation || "N/A"}
            </p>
            <p className="flex items-center gap-1 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              Days in Recon: {vehicle.daysInRecon}
            </p>
            <p className="flex items-center gap-1 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              Assigned To: {vehicle.assignedTo?.name || "Unassigned"}
            </p>
            <p className="flex items-center gap-1 text-sm">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              Recon Cost: ${vehicle.reconditioningCost?.toFixed(2) || "0.00"}
            </p>
            <p className="text-lg font-semibold mt-4">Status: {vehicle.status}</p>
          </CardContent>
        </Card>
      )}

      {vehicle && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" /> Update Status
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
            <Button
              onClick={() => handleStatusUpdate("COMPLETED")}
              disabled={loading || vehicle.status === "COMPLETED"}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              Complete
            </Button>
            <Button
              onClick={() => handleStatusUpdate("ON_HOLD")}
              disabled={loading || vehicle.status === "ON_HOLD"}
              className="bg-yellow-500 hover:bg-yellow-600 text-white"
            >
              On Hold
            </Button>
            <Button
              onClick={() => handleStatusUpdate("IN_PROGRESS")}
              disabled={loading || vehicle.status === "IN_PROGRESS"}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              In Progress
            </Button>
            <Button
              onClick={() => handleStatusUpdate("CANCELED")}
              disabled={loading || vehicle.status === "CANCELED"}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Cancel
            </Button>
          </CardContent>
        </Card>
      )}

      {vehicle && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" /> Add Timeline Event
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="department">Current Department (Optional)</label>
              <Input
                id="department"
                placeholder="e.g., Mechanical, Detail"
                value={currentDepartment}
                onChange={(e) => setCurrentDepartment(e.target.value)}
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="eventDescription">Event Description</label>
              <Textarea
                id="eventDescription"
                placeholder="Add a note about this event..."
                value={eventDescription}
                onChange={(e) => setEventDescription(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button onClick={() => handleAddEvent("NOTE")} disabled={loading || !eventDescription}>
                Add Note
              </Button>
              <Button onClick={() => handleAddEvent("DEPARTMENT_CHANGE")} disabled={loading || !currentDepartment}>
                Change Dept.
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
