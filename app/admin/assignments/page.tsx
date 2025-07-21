"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, PlusCircle } from "lucide-react"
import { fetchAssignments } from "@/app/actions/assignments"
import { fetchVehicles } from "@/app/actions/vehicles"
import { fetchUsersForSelect } from "@/app/actions/users"
import { Suspense } from "react"
import { AssignmentForm } from "@/components/assignment-form"
import { AssignmentTable } from "@/components/assignment-table"

interface VehicleAssignment {
  id: string
  status: string
  priority: string
  dueDate?: string
  notes?: string
  team: {
    id: string
    name: string
    department: string
  }
  user?: {
    id: string
    name?: string
    email: string
  }
  vehicle: {
    id: string
    vin: string
    make: string
    model: string
    year: number
    status: string
  }
}

interface Team {
  id: string
  name: string
  department: string
  users: Array<{
    id: string
    name?: string
    email: string
  }>
}

export const dynamic = "force-dynamic"

export default async function AssignmentsPage() {
  const {
    assignments,
    totalPages,
    currentPage,
    success: assignmentsSuccess,
    message: assignmentsMessage,
  } = await fetchAssignments()
  const {
    vehicles,
    success: vehiclesSuccess,
    message: vehiclesMessage,
  } = await fetchVehicles("", "IN_PROGRESS", undefined, 1, 1000) // Fetch all in-progress vehicles
  const { users: usersForSelect, success: usersSuccess, message: usersMessage } = await fetchUsersForSelect()

  if (!assignmentsSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] p-4">
        <h2 className="text-2xl font-bold text-red-600">Error Loading Assignments</h2>
        <p className="text-gray-600 mt-2">{assignmentsMessage}</p>
      </div>
    )
  }

  if (!vehiclesSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] p-4">
        <h2 className="text-2xl font-bold text-red-600">Error Loading Vehicles</h2>
        <p className="text-gray-600 mt-2">{vehiclesMessage}</p>
      </div>
    )
  }

  if (!usersSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] p-4">
        <h2 className="text-2xl font-bold text-red-600">Error Loading Users</h2>
        <p className="text-gray-600 mt-2">{usersMessage}</p>
      </div>
    )
  }

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-2">Loading assignments...</p>
        </div>
      }
    >
      <div className="flex flex-col gap-6 p-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>Assignment Management</CardTitle>
            <AssignmentForm
              vehicles={vehicles.vehicles}
              users={usersForSelect}
              trigger={
                <Button size="sm">
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Assignment
                </Button>
              }
            />
          </CardHeader>
          <CardContent>
            <AssignmentTable
              initialAssignments={assignments}
              initialTotalPages={totalPages}
              initialCurrentPage={currentPage}
              vehiclesForSelect={vehicles.vehicles}
              usersForSelect={usersForSelect}
            />
          </CardContent>
        </Card>
      </div>
    </Suspense>
  )
}
