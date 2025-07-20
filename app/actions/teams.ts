"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function getTeams() {
  try {
    const session = await auth()

    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MANAGER")) {
      return { success: false, error: "Unauthorized access" }
    }

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
        createdAt: "desc",
      },
    })

    const formattedTeams = teams.map((team) => ({
      id: team.id,
      name: team.name,
      description: team.description,
      department: team.department,
      isActive: team.isActive,
      users: team.users,
      vehicleCount: team._count.vehicleAssignments,
    }))

    return { success: true, teams: formattedTeams }
  } catch (error) {
    console.error("Error fetching teams:", error)
    return { success: false, error: "Failed to fetch teams" }
  }
}

export async function createTeam(formData: FormData) {
  try {
    const session = await auth()

    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MANAGER")) {
      return { success: false, error: "Unauthorized access" }
    }

    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const department = formData.get("department") as string

    if (!name || !department) {
      return { success: false, error: "Name and department are required" }
    }

    // Check if team name already exists
    const existingTeam = await prisma.team.findFirst({
      where: {
        name: {
          equals: name,
          mode: "insensitive",
        },
      },
    })

    if (existingTeam) {
      return { success: false, error: "Team name already exists" }
    }

    const team = await prisma.team.create({
      data: {
        name,
        description: description || null,
        department,
        isActive: true,
        createdBy: session.user.id,
      },
    })

    revalidatePath("/admin/teams")
    return { success: true, team }
  } catch (error) {
    console.error("Error creating team:", error)
    return { success: false, error: "Failed to create team" }
  }
}

export async function updateTeam(teamId: string, formData: FormData) {
  try {
    const session = await auth()

    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MANAGER")) {
      return { success: false, error: "Unauthorized access" }
    }

    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const department = formData.get("department") as string
    const isActive = formData.get("isActive") === "true"

    if (!name || !department) {
      return { success: false, error: "Name and department are required" }
    }

    const team = await prisma.team.update({
      where: { id: teamId },
      data: {
        name,
        description: description || null,
        department,
        isActive,
        updatedAt: new Date(),
      },
    })

    revalidatePath("/admin/teams")
    return { success: true, team }
  } catch (error) {
    console.error("Error updating team:", error)
    return { success: false, error: "Failed to update team" }
  }
}

export async function deleteTeam(teamId: string) {
  try {
    const session = await auth()

    if (!session || session.user.role !== "ADMIN") {
      return { success: false, error: "Admin access required" }
    }

    // Check if team has active assignments
    const activeAssignments = await prisma.vehicleAssignment.count({
      where: {
        teamId,
        isActive: true,
      },
    })

    if (activeAssignments > 0) {
      return { success: false, error: "Cannot delete team with active vehicle assignments" }
    }

    await prisma.team.delete({
      where: { id: teamId },
    })

    revalidatePath("/admin/teams")
    return { success: true }
  } catch (error) {
    console.error("Error deleting team:", error)
    return { success: false, error: "Failed to delete team" }
  }
}

export async function addUserToTeam(teamId: string, userId: string) {
  try {
    const session = await auth()

    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MANAGER")) {
      return { success: false, error: "Unauthorized access" }
    }

    // Check if user is already in a team
    const existingMembership = await prisma.teamMember.findFirst({
      where: {
        userId,
        isActive: true,
      },
    })

    if (existingMembership) {
      return { success: false, error: "User is already assigned to a team" }
    }

    const teamMember = await prisma.teamMember.create({
      data: {
        teamId,
        userId,
        isActive: true,
        assignedBy: session.user.id,
      },
    })

    revalidatePath("/admin/teams")
    return { success: true, teamMember }
  } catch (error) {
    console.error("Error adding user to team:", error)
    return { success: false, error: "Failed to add user to team" }
  }
}

export async function removeUserFromTeam(teamId: string, userId: string) {
  try {
    const session = await auth()

    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MANAGER")) {
      return { success: false, error: "Unauthorized access" }
    }

    await prisma.teamMember.updateMany({
      where: {
        teamId,
        userId,
        isActive: true,
      },
      data: {
        isActive: false,
        updatedAt: new Date(),
      },
    })

    revalidatePath("/admin/teams")
    return { success: true }
  } catch (error) {
    console.error("Error removing user from team:", error)
    return { success: false, error: "Failed to remove user from team" }
  }
}
