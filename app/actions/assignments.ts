"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function getVehicleAssignments() {
  try {
    const assignments = await prisma.vehicleAssignment.findMany({
      include: {
        vehicle: true,
        team: {
          include: {
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
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
        assignedAt: "desc",
      },
    })

    return assignments
  } catch (error) {
    console.error("Error fetching vehicle assignments:", error)
    throw new Error("Failed to fetch vehicle assignments")
  }
}

export async function assignVehicleToTeam(formData: FormData) {
  const session = await auth()

  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "MANAGER")) {
    throw new Error("Unauthorized")
  }

  const vehicleId = formData.get("vehicleId") as string
  const teamId = formData.get("teamId") as string
  const userId = (formData.get("userId") as string) || null
  const notes = (formData.get("notes") as string) || null

  if (!vehicleId || !teamId) {
    throw new Error("Vehicle and team are required")
  }

  try {
    // Check if assignment already exists
    const existingAssignment = await prisma.vehicleAssignment.findFirst({
      where: {
        vehicleId,
        status: {
          in: ["ASSIGNED", "IN_PROGRESS"],
        },
      },
    })

    if (existingAssignment) {
      throw new Error("Vehicle is already assigned to a team")
    }

    // Create new assignment
    await prisma.vehicleAssignment.create({
      data: {
        vehicleId,
        teamId,
        userId: userId || null,
        notes,
        status: "ASSIGNED",
      },
    })

    // Update vehicle status
    await prisma.vehicle.update({
      where: { id: vehicleId },
      data: { status: "ASSIGNED" },
    })

    revalidatePath("/admin/assignments")
    return { success: true, message: "Vehicle assigned successfully" }
  } catch (error) {
    console.error("Error assigning vehicle:", error)
    throw new Error("Failed to assign vehicle")
  }
}

export async function updateAssignmentStatus(assignmentId: string, status: string) {
  const session = await auth()

  if (!session?.user) {
    throw new Error("Unauthorized")
  }

  try {
    const assignment = await prisma.vehicleAssignment.update({
      where: { id: assignmentId },
      data: {
        status,
        completedAt: status === "COMPLETED" ? new Date() : null,
      },
      include: {
        vehicle: true,
      },
    })

    // Update vehicle status based on assignment status
    let vehicleStatus = "PENDING"
    if (status === "IN_PROGRESS") vehicleStatus = "IN_PROGRESS"
    if (status === "COMPLETED") vehicleStatus = "COMPLETED"

    await prisma.vehicle.update({
      where: { id: assignment.vehicleId },
      data: {
        status: vehicleStatus,
        completedAt: status === "COMPLETED" ? new Date() : null,
      },
    })

    revalidatePath("/admin/assignments")
    revalidatePath("/recon/cards")
    return { success: true, message: "Assignment status updated successfully" }
  } catch (error) {
    console.error("Error updating assignment status:", error)
    throw new Error("Failed to update assignment status")
  }
}

export async function deleteAssignment(assignmentId: string) {
  const session = await auth()

  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "MANAGER")) {
    throw new Error("Unauthorized")
  }

  try {
    const assignment = await prisma.vehicleAssignment.findUnique({
      where: { id: assignmentId },
      include: { vehicle: true },
    })

    if (!assignment) {
      throw new Error("Assignment not found")
    }

    await prisma.vehicleAssignment.delete({
      where: { id: assignmentId },
    })

    // Reset vehicle status to pending
    await prisma.vehicle.update({
      where: { id: assignment.vehicleId },
      data: { status: "PENDING" },
    })

    revalidatePath("/admin/assignments")
    return { success: true, message: "Assignment deleted successfully" }
  } catch (error) {
    console.error("Error deleting assignment:", error)
    throw new Error("Failed to delete assignment")
  }
}

export async function getAvailableVehicles() {
  try {
    const vehicles = await prisma.vehicle.findMany({
      where: {
        assignments: {
          none: {
            status: {
              in: ["ASSIGNED", "IN_PROGRESS"],
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return vehicles
  } catch (error) {
    console.error("Error fetching available vehicles:", error)
    throw new Error("Failed to fetch available vehicles")
  }
}
