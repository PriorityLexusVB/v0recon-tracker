import { Loader2 } from "lucide-react"

export default function TimelineLoading() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
      <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
      <p className="ml-4 text-lg text-gray-600">Loading timeline dashboard...</p>
    </div>
  )
}
