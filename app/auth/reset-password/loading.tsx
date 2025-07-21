import { Loader2 } from "lucide-react"

export default function ResetPasswordLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
      <p className="ml-4 text-lg text-gray-600">Loading reset password page...</p>
    </div>
  )
}
