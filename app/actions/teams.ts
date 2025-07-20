"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function getTeams() {
  const session = await auth()

  if (!session) {
    redirect("/auth/signin")
  }

  try {
    const teams = await prisma.team.findMany({
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        _count: {
          select: {
            vehicleAssignments: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    })

    return {
      success: true,
      teams: teams.map((team) => ({
        ...team,
        vehicleCount: team._count.vehicleAssignments,
      })),
    }
  } catch (error) {
    console.error("Error fetching teams:", error)
    return {
      success: false,
      error: "Failed to fetch teams",
    }
  }
}

export async function createTeam(formData: FormData) {
  const session = await auth()

  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MANAGER")) {
    throw new Error("Unauthorized")
  }

  const name = formData.get("name") as string
  const description = formData.get("description") as string
  const department = formData.get("department") as string

  if (!name || !department) {
    return {
      success: false,
      error: "Name and department are required",
    }
  }

  try {
    const team = await prisma.team.create({
      data: {
        name,
        description: description || null,
        department,
        isActive: true,
      },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        _count: {
          select: {
            vehicleAssignments: true,
          },
        },
      },
    })

    revalidatePath("/admin/teams")

    return {
      success: true,
      team: {
        ...team,
        vehicleCount: team._count.vehicleAssignments,
      },
    }
  } catch (error) {
    console.error("Error creating team:", error)
    return {
      success: false,
      error: "Failed to create team",
    }
  }
}

export async function updateTeam(teamId: string, formData: FormData) {
  const session = await auth()

  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MANAGER")) {
    throw new Error("Unauthorized")
  }

  const name = formData.get("name") as string
  const description = formData.get("description") as string
  const department = formData.get("department") as string
  const isActive = formData.get("isActive") === "true"

  try {
    const team = await prisma.team.update({
      where: { id: teamId },
      data: {
        name,
        description: description || null,
        department,
        isActive,
      },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        _count: {
          select: {
            vehicleAssignments: true,
          },
        },
      },
    })

    revalidatePath("/admin/teams")

    return {
      success: true,
      team: {
        ...team,
        vehicleCount: team._count.vehicleAssignments,
      },
    }
  } catch (error) {
    console.error("Error updating team:", error)
    return {
      success: false,
      error: "Failed to update team",
    }
  }
}

export async function deleteTeam(teamId: string) {
  const session = await auth()

  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized")
  }

  try {
    // Check if team has active assignments
    const assignmentCount = await prisma.vehicleAssignment.count({
      where: { teamId },
    })

    if (assignmentCount > 0) {
      return {
        success: false,
        error: "Cannot delete team with active vehicle assignments",
      }
    }

    await prisma.team.delete({
      where: { id: teamId },
    })

    revalidatePath("/admin/teams")

    return {
      success: true,
    }
  } catch (error) {
    console.error("Error deleting team:", error)
    return {
      success: false,
      error: "Failed to delete team",
    }
  }
}

export async function addUserToTeam(teamId: string, userId: string) {
  const session = await auth()

  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MANAGER")) {
    throw new Error("Unauthorized")
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { teamId },
    })

    revalidatePath("/admin/teams")

    return {
      success: true,
    }
  } catch (error) {
    console.error("Error adding user to team:", error)
    return {
      success: false,
      error: "Failed to add user to team",
    }
  }
}

export async function removeUserFromTeam(userId: string) {
  const session = await auth()

  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MANAGER")) {
    throw new Error("Unauthorized")
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { teamId: null },
    })

    revalidatePath("/admin/teams")

    return {
      success: true,
    }
  } catch (error) {
    console.error("Error removing user from team:", error)
    return {
      success: false,
      error: "Failed to remove user from team",
    }
  }
}
