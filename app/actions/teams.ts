"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function getTeams() {
  try {
    const teams = await prisma.team.findMany({
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
        },
        assignments: {
          include: {
            vehicle: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return teams
  } catch (error) {
    console.error("Error fetching teams:", error)
    throw new Error("Failed to fetch teams")
  }
}

export async function createTeam(formData: FormData) {
  const session = await auth()

  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "MANAGER")) {
    throw new Error("Unauthorized")
  }

  const name = formData.get("name") as string
  const description = formData.get("description") as string

  if (!name) {
    throw new Error("Team name is required")
  }

  try {
    await prisma.team.create({
      data: {
        name,
        description: description || null,
      },
    })

    revalidatePath("/admin/teams")
    return { success: true, message: "Team created successfully" }
  } catch (error) {
    console.error("Error creating team:", error)
    throw new Error("Failed to create team")
  }
}

export async function updateTeam(id: string, formData: FormData) {
  const session = await auth()

  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "MANAGER")) {
    throw new Error("Unauthorized")
  }

  const name = formData.get("name") as string
  const description = formData.get("description") as string

  if (!name) {
    throw new Error("Team name is required")
  }

  try {
    await prisma.team.update({
      where: { id },
      data: {
        name,
        description: description || null,
      },
    })

    revalidatePath("/admin/teams")
    return { success: true, message: "Team updated successfully" }
  } catch (error) {
    console.error("Error updating team:", error)
    throw new Error("Failed to update team")
  }
}

export async function deleteTeam(id: string) {
  const session = await auth()

  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized")
  }

  try {
    await prisma.team.delete({
      where: { id },
    })

    revalidatePath("/admin/teams")
    return { success: true, message: "Team deleted successfully" }
  } catch (error) {
    console.error("Error deleting team:", error)
    throw new Error("Failed to delete team")
  }
}

export async function addTeamMember(teamId: string, userId: string, role = "MEMBER") {
  const session = await auth()

  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "MANAGER")) {
    throw new Error("Unauthorized")
  }

  try {
    await prisma.teamMember.create({
      data: {
        teamId,
        userId,
        role,
      },
    })

    revalidatePath("/admin/teams")
    return { success: true, message: "Team member added successfully" }
  } catch (error) {
    console.error("Error adding team member:", error)
    throw new Error("Failed to add team member")
  }
}

export async function removeTeamMember(teamId: string, userId: string) {
  const session = await auth()

  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "MANAGER")) {
    throw new Error("Unauthorized")
  }

  try {
    await prisma.teamMember.delete({
      where: {
        userId_teamId: {
          userId,
          teamId,
        },
      },
    })

    revalidatePath("/admin/teams")
    return { success: true, message: "Team member removed successfully" }
  } catch (error) {
    console.error("Error removing team member:", error)
    throw new Error("Failed to remove team member")
  }
}
