import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "./prisma"

export async function getCurrentUser() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return null
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { team: true },
    })
    return user
  } catch (error) {
    console.error("Error fetching current user:", error)
    return null
  }
}

export async function isAdmin() {
  const user = await getCurrentUser()
  return user?.role === "ADMIN"
}

export async function isManager() {
  const user = await getCurrentUser()
  return user?.role === "MANAGER" || user?.role === "ADMIN"
}
