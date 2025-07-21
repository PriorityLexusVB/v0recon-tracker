"use server"

import { prisma } from "@/lib/prisma"
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

export async function createTeam(data: { name: string; description?: string }) {
  try {
    const team = await prisma.team.create({
      data: {
        name: data.name,
        description: data.description,
      },
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
    })

    revalidatePath("/admin/teams")
    return { success: true, team }
  } catch (error) {
    console.error("Error creating team:", error)
    return { success: false, error: "Failed to create team" }
  }
}

export async function updateTeam(id: string, data: { name: string; description?: string }) {
  try {
    const team = await prisma.team.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
      },
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
    })

    revalidatePath("/admin/teams")
    return { success: true, team }
  } catch (error) {
    console.error("Error updating team:", error)
    return { success: false, error: "Failed to update team" }
  }
}

export async function deleteTeam(id: string) {
  try {
    await prisma.team.delete({
      where: { id },
    })

    revalidatePath("/admin/teams")
    return { success: true }
  } catch (error) {
    console.error("Error deleting team:", error)
    return { success: false, error: "Failed to delete team" }
  }
}

export async function addTeamMember(teamId: string, userId: string, role = "MEMBER") {
  try {
    const teamMember = await prisma.teamMember.create({
      data: {
        teamId,
        userId,
        role,
      },
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
    })

    revalidatePath("/admin/teams")
    return { success: true, teamMember }
  } catch (error) {
    console.error("Error adding team member:", error)
    return { success: false, error: "Failed to add team member" }
  }
}

export async function removeTeamMember(teamId: string, userId: string) {
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
    return { success: true }
  } catch (error) {
    console.error("Error removing team member:", error)
    return { success: false, error: "Failed to remove team member" }
  }
}
