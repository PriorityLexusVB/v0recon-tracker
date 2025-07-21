import { VehicleGrid } from "@/components/vehicle-grid"
import { VehicleFilters } from "@/components/vehicle-filters"
import { fetchVehicles } from "@/app/actions/vehicles"
import { Suspense } from "react"
import { Loader2 } from "lucide-react"
import { AddVehicleForm } from "@/components/add-vehicle-form"
import { fetchUsersForSelect } from "@/app/actions/users"

export const dynamic = "force-dynamic"

interface ReconCardsPageProps {
  searchParams: {
    query?: string
    status?: string
    assignedTo?: string
    page?: string
  }
}

export default async function ReconCardsPage({ searchParams }: ReconCardsPageProps) {
  const query = searchParams.query || ""
  const status = searchParams.status || "ALL"
  const assignedTo = searchParams.assignedTo || "ALL"
  const page = Number.parseInt(searchParams.page || "1")

  const { vehicles, totalPages, currentPage, success, message } = await fetchVehicles(query, status, assignedTo, page)
  const { users: usersForSelect, success: usersSuccess, message: usersMessage } = await fetchUsersForSelect()

  if (!success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] p-4">
        <h2 className="text-2xl font-bold text-red-600">Error Loading Vehicles</h2>
        <p className="text-gray-600 mt-2">{message}</p>
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
          <p className="ml-2">Loading vehicles...</p>
        </div>
      }
    >
      <div className="flex flex-col gap-6 p-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Recon Vehicles</h1>
          <AddVehicleForm users={usersForSelect} />
        </div>
        <VehicleFilters
          filters={{ query, status, assignedTo, page }}
          setFilters={() => {
            /* Handled by URL search params */
          }}
          onApplyFilters={() => {
            /* No-op, as filters are applied via URL */
          }}
          onClearFilters={() => {
            /* No-op, as filters are applied via URL */
          }}
        />
        <VehicleGrid vehicles={vehicles} loading={false} error={null} />
        {/* Pagination can be added here if needed */}
      </div>
    </Suspense>
  )
}
