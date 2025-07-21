import { Loader2 } from "lucide-react"

export default function SignInLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
        <p className="text-gray-600">Loading sign in page...</p>
      </div>
    </div>
  )
}
