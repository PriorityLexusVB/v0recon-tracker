"use server"

import { prisma } from "@/lib/prisma"
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
        createdAt: "desc",
      },
    })
    return assignments
  } catch (error) {
    console.error("Error fetching vehicle assignments:", error)
    throw new Error("Failed to fetch vehicle assignments")
  }
}

export async function assignVehicleToTeam(data: {
  vehicleId: string
  teamId: string
  userId?: string
}) {
  try {
    const assignment = await prisma.vehicleAssignment.create({
      data: {
        vehicleId: data.vehicleId,
        teamId: data.teamId,
        userId: data.userId,
        status: "ASSIGNED",
      },
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
    })

    // Update vehicle status
    await prisma.vehicle.update({
      where: { id: data.vehicleId },
      data: { status: "ASSIGNED" },
    })

    revalidatePath("/admin/assignments")
    revalidatePath("/recon/cards")
    return { success: true, assignment }
  } catch (error) {
    console.error("Error assigning vehicle to team:", error)
    return { success: false, error: "Failed to assign vehicle to team" }
  }
}

export async function updateAssignmentStatus(id: string, status: string) {
  try {
    const assignment = await prisma.vehicleAssignment.update({
      where: { id },
      data: { status },
      include: {
        vehicle: true,
        team: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    // Update vehicle status based on assignment status
    let vehicleStatus = "PENDING"
    if (status === "IN_PROGRESS") vehicleStatus = "IN_PROGRESS"
    if (status === "COMPLETED") vehicleStatus = "COMPLETED"

    await prisma.vehicle.update({
      where: { id: assignment.vehicleId },
      data: { status: vehicleStatus },
    })

    revalidatePath("/admin/assignments")
    revalidatePath("/recon/cards")
    return { success: true, assignment }
  } catch (error) {
    console.error("Error updating assignment status:", error)
    return { success: false, error: "Failed to update assignment status" }
  }
}

export async function deleteAssignment(id: string) {
  try {
    const assignment = await prisma.vehicleAssignment.findUnique({
      where: { id },
      include: { vehicle: true },
    })

    if (!assignment) {
      return { success: false, error: "Assignment not found" }
    }

    await prisma.vehicleAssignment.delete({
      where: { id },
    })

    // Reset vehicle status to pending
    await prisma.vehicle.update({
      where: { id: assignment.vehicleId },
      data: { status: "PENDING" },
    })

    revalidatePath("/admin/assignments")
    revalidatePath("/recon/cards")
    return { success: true }
  } catch (error) {
    console.error("Error deleting assignment:", error)
    return { success: false, error: "Failed to delete assignment" }
  }
}
