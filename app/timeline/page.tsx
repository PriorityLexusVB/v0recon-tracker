import { TimelineDashboard } from "@/components/timeline/timeline-dashboard"
import { fetchTimelineEvents } from "@/app/actions/vehicles"
import { fetchUsersForSelect } from "@/app/actions/users"
import { Suspense } from "react"
import { Loader2 } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function TimelinePage() {
  const { events, totalPages, currentPage, success, message } = await fetchTimelineEvents()
  const { users: usersForSelect, success: usersSuccess, message: usersMessage } = await fetchUsersForSelect()

  if (!success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] p-4">
        <h2 className="text-2xl font-bold text-red-600">Error Loading Timeline</h2>
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
          <p className="ml-2">Loading timeline...</p>
        </div>
      }
    >
      <TimelineDashboard
        initialEvents={events}
        initialTotalPages={totalPages}
        initialCurrentPage={currentPage}
        usersForSelect={usersForSelect}
      />
    </Suspense>
  )
}
