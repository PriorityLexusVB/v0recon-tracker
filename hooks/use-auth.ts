"use client"

import { useSession } from "next-auth/react"
import { useMemo } from "react"
import type { User } from "@/lib/types" // Assuming you have a User type defined

export function useAuth() {
  const { data: session, status } = useSession()

  const user: User | null = useMemo(() => {
    if (status === "authenticated" && session?.user) {
      // Cast session.user to your User type if it matches your schema
      // Ensure your NextAuth.js session callback populates the user object correctly
      return {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
        role: session.user.role, // Make sure 'role' is added to your session type
        teamId: session.user.teamId, // Make sure 'teamId' is added to your session type
        department: session.user.department, // Make sure 'department' is added
      } as User
    }
    return null
  }, [session, status])

  return {
    user,
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
    isAdmin: user?.role === "ADMIN",
    isManager: user?.role === "MANAGER" || user?.role === "ADMIN",
  }
}
