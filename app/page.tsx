import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import Dashboard from "@/components/dashboard" // Assuming you have a Dashboard component

export default async function HomePage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/signin")
  }

  // Redirect based on user role or default to a specific dashboard view
  // For now, let's assume a general dashboard for all logged-in users
  // You might want to redirect to /admin, /recon/cards, or /timeline based on role
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <Dashboard />
    </main>
  )
}
