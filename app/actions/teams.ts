"use server"

import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { CreateTeamSchema, AssignVehicleSchema, UpdateUserTeamSchema } from "@/lib/definitions"
import { revalidatePath } from "next/cache"

export async function createTeam(prevState: string | undefined, formData: FormData) {
  const session = await auth()

  if (!session?.user?.id || (session.user.role !== "admin" && session.user.role !== "manager")) {
    return "Unauthorized - Admin or Manager access required"
  }

  const validatedFields = CreateTeamSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    department: formData.get("department"),
  })

  if (!validatedFields.success) {
    return "Invalid fields"
  }

  const { name, description, department } = validatedFields.data

  try {
    await prisma.team.create({
      data: {
        name,
        description,
        department,
      },
    })

    revalidatePath("/admin/teams")
    return "Team created successfully"
  } catch (error) {
    console.error("Create team error:", error)
    return "Failed to create team"
  }
}

export async function assignVehicleToTeam(prevState: string | undefined, formData: FormData) {
  const session = await auth()

  if (!session?.user?.id || (session.user.role !== "admin" && session.user.role !== "manager")) {
    return "Unauthorized - Admin or Manager access required"
  }

  const validatedFields = AssignVehicleSchema.safeParse({
    vin: formData.get("vin"),
    teamId: formData.get("teamId"),
    userId: formData.get("userId") || undefined,
    priority: formData.get("priority"),
    dueDate: formData.get("dueDate") || undefined,
    notes: formData.get("notes") || undefined,
  })

  if (!validatedFields.success) {
    return "Invalid fields"
  }

  const { vin, teamId, userId, priority, dueDate, notes } = validatedFields.data

  try {
    // Check if vehicle is already assigned to this team
    const existingAssignment = await prisma.vehicleAssignment.findUnique({
      where: {
        vin_teamId: {
          vin,
          teamId,
        },
      },
    })

    if (existingAssignment) {
      return "Vehicle is already assigned to this team"
    }

    await prisma.vehicleAssignment.create({
      data: {
        vin,
        teamId,
        userId,
        priority,
        dueDate: dueDate ? new Date(dueDate) : null,
        notes,
      },
    })

    revalidatePath("/admin/assignments")
    revalidatePath("/recon/cards")
    return "Vehicle assigned successfully"
  } catch (error) {
    console.error("Assign vehicle error:", error)
    return "Failed to assign vehicle"
  }
}

export async function updateUserTeam(prevState: string | undefined, formData: FormData) {
  const session = await auth()

  if (!session?.user?.id || (session.user.role !== "admin" && session.user.role !== "manager")) {
    return "Unauthorized - Admin or Manager access required"
  }

  const validatedFields = UpdateUserTeamSchema.safeParse({
    userId: formData.get("userId"),
    teamId: formData.get("teamId") || undefined,
  })

  if (!validatedFields.success) {
    return "Invalid fields"
  }

  const { userId, teamId } = validatedFields.data

  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        teamId: teamId || null,
      },
    })

    revalidatePath("/admin/users")
    return "User team updated successfully"
  } catch (error) {
    console.error("Update user team error:", error)
    return "Failed to update user team"
  }
}

export async function getTeams() {
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
        vehicles: {
          select: {
            id: true,
            vin: true,
            status: true,
            priority: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    })

    return teams.map((team) => ({
      ...team,
      vehicleCount: team.vehicles.length,
    }))
  } catch (error) {
    console.error("Get teams error:", error)
    return []
  }
}

export async function getVehicleAssignments() {
  try {
    const assignments = await prisma.vehicleAssignment.findMany({
      include: {
        team: {
          select: {
            id: true,
            name: true,
            department: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return assignments
  } catch (error) {
    console.error("Get vehicle assignments error:", error)
    return []
  }
}
