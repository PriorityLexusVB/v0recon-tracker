"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function getVehicleAssignments() {
  try {
    const session = await auth()

    if (!session) {
      return { success: false, error: "Authentication required" }
    }

    const assignments = await prisma.vehicleAssignment.findMany({
      where: {
        isActive: true,
      },
      include: {
        vehicle: true,
        team: {
          include: {
            users: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        assignedToUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        assignedBy: {
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

    return { success: true, assignments }
  } catch (error) {
    console.error("Error fetching vehicle assignments:", error)
    return { success: false, error: "Failed to fetch assignments" }
  }
}

export async function assignVehicleToTeam(formData: FormData) {
  try {
    const session = await auth()

    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MANAGER")) {
      return { success: false, error: "Unauthorized access" }
    }

    const vehicleId = formData.get("vehicleId") as string
    const teamId = formData.get("teamId") as string
    const userId = formData.get("userId") as string
    const priority = formData.get("priority") as string
    const notes = formData.get("notes") as string

    if (!vehicleId || !teamId) {
      return { success: false, error: "Vehicle and team are required" }
    }

    // Check if vehicle is already assigned
    const existingAssignment = await prisma.vehicleAssignment.findFirst({
      where: {
        vehicleId,
        isActive: true,
      },
    })

    if (existingAssignment) {
      return { success: false, error: "Vehicle is already assigned" }
    }

    // Verify the vehicle exists
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
    })

    if (!vehicle) {
      return { success: false, error: "Vehicle not found" }
    }

    // Verify the team exists
    const team = await prisma.team.findUnique({
      where: { id: teamId },
    })

    if (!team) {
      return { success: false, error: "Team not found" }
    }

    // If userId is provided, verify the user exists and is in the team
    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      })

      if (!user) {
        return { success: false, error: "User not found" }
      }

      const teamMember = await prisma.teamMember.findFirst({
        where: {
          teamId,
          userId,
          isActive: true,
        },
      })

      if (!teamMember) {
        return { success: false, error: "User is not a member of the selected team" }
      }
    }

    const assignment = await prisma.vehicleAssignment.create({
      data: {
        vehicleId,
        teamId,
        assignedToUserId: userId || null,
        priority: priority || "normal",
        notes: notes || null,
        assignedById: session.user.id,
        isActive: true,
      },
    })

    // Update vehicle status
    await prisma.vehicle.update({
      where: { id: vehicleId },
      data: {
        status: "ASSIGNED",
        assignedTo: userId || null,
        updatedAt: new Date(),
      },
    })

    revalidatePath("/admin/assignments")
    revalidatePath("/recon/cards")
    return { success: true, assignment }
  } catch (error) {
    console.error("Error assigning vehicle:", error)
    return { success: false, error: "Failed to assign vehicle" }
  }
}

export async function updateVehicleAssignment(assignmentId: string, formData: FormData) {
  try {
    const session = await auth()

    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MANAGER")) {
      return { success: false, error: "Unauthorized access" }
    }

    const teamId = formData.get("teamId") as string
    const userId = formData.get("userId") as string
    const priority = formData.get("priority") as string
    const notes = formData.get("notes") as string

    const assignment = await prisma.vehicleAssignment.update({
      where: { id: assignmentId },
      data: {
        teamId: teamId || undefined,
        assignedToUserId: userId || null,
        priority: priority || "normal",
        notes: notes || null,
        updatedAt: new Date(),
      },
    })

    // Update vehicle assignment
    if (userId) {
      await prisma.vehicle.update({
        where: { id: assignment.vehicleId },
        data: {
          assignedTo: userId,
          updatedAt: new Date(),
        },
      })
    }

    revalidatePath("/admin/assignments")
    revalidatePath("/recon/cards")
    return { success: true, assignment }
  } catch (error) {
    console.error("Error updating assignment:", error)
    return { success: false, error: "Failed to update assignment" }
  }
}

export async function removeVehicleAssignment(assignmentId: string) {
  try {
    const session = await auth()

    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MANAGER")) {
      return { success: false, error: "Unauthorized access" }
    }

    const assignment = await prisma.vehicleAssignment.findUnique({
      where: { id: assignmentId },
    })

    if (!assignment) {
      return { success: false, error: "Assignment not found" }
    }

    // Deactivate the assignment
    await prisma.vehicleAssignment.update({
      where: { id: assignmentId },
      data: {
        isActive: false,
        updatedAt: new Date(),
      },
    })

    // Update vehicle status
    await prisma.vehicle.update({
      where: { id: assignment.vehicleId },
      data: {
        status: "PENDING",
        assignedTo: null,
        updatedAt: new Date(),
      },
    })

    revalidatePath("/admin/assignments")
    revalidatePath("/recon/cards")
    return { success: true }
  } catch (error) {
    console.error("Error removing assignment:", error)
    return { success: false, error: "Failed to remove assignment" }
  }
}

export async function getTeamsForAssignment() {
  try {
    const session = await auth()

    if (!session) {
      return { success: false, error: "Authentication required" }
    }

    const teams = await prisma.team.findMany({
      where: {
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
      },
      orderBy: {
        name: "asc",
      },
    })

    return { success: true, teams }
  } catch (error) {
    console.error("Error fetching teams for assignment:", error)
    return { success: false, error: "Failed to fetch teams" }
  }
}

export async function getUnassignedVehicles() {
  try {
    const session = await auth()

    if (!session) {
      return { success: false, error: "Authentication required" }
    }

    const vehicles = await prisma.vehicle.findMany({
      where: {
        OR: [
          { status: "PENDING" },
          {
            vehicleAssignments: {
              none: {
                isActive: true,
              },
            },
          },
        ],
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return { success: true, vehicles }
  } catch (error) {
    console.error("Error fetching unassigned vehicles:", error)
    return { success: false, error: "Failed to fetch vehicles" }
  }
}
