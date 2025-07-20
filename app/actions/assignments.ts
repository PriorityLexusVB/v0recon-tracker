"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function getAssignments() {
  const session = await auth()

  if (!session) {
    redirect("/auth/signin")
  }

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
        vehicle: {
          select: {
            id: true,
            vin: true,
            make: true,
            model: true,
            year: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return {
      success: true,
      assignments,
    }
  } catch (error) {
    console.error("Error fetching assignments:", error)
    return {
      success: false,
      error: "Failed to fetch assignments",
    }
  }
}

export async function createAssignment(formData: FormData) {
  const session = await auth()

  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MANAGER")) {
    throw new Error("Unauthorized")
  }

  const vin = formData.get("vin") as string
  const teamId = formData.get("teamId") as string
  const userId = formData.get("userId") as string
  const priority = formData.get("priority") as string
  const dueDate = formData.get("dueDate") as string
  const notes = formData.get("notes") as string

  if (!vin || !teamId) {
    return {
      success: false,
      error: "VIN and team are required",
    }
  }

  try {
    // First, find or create the vehicle
    let vehicle = await prisma.vehicle.findUnique({
      where: { vin },
    })

    if (!vehicle) {
      // Create a basic vehicle record if it doesn't exist
      vehicle = await prisma.vehicle.create({
        data: {
          vin,
          status: "PENDING",
          // These will be updated when Google Sheets data is synced
          make: "Unknown",
          model: "Unknown",
          year: new Date().getFullYear(),
        },
      })
    }

    // Check if assignment already exists
    const existingAssignment = await prisma.vehicleAssignment.findFirst({
      where: {
        vehicleId: vehicle.id,
        status: {
          not: "COMPLETED",
        },
      },
    })

    if (existingAssignment) {
      return {
        success: false,
        error: "Vehicle already has an active assignment",
      }
    }

    const assignment = await prisma.vehicleAssignment.create({
      data: {
        vehicleId: vehicle.id,
        teamId,
        userId: userId || null,
        priority: priority as any,
        dueDate: dueDate ? new Date(dueDate) : null,
        notes: notes || null,
        status: "ASSIGNED",
      },
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
        vehicle: {
          select: {
            id: true,
            vin: true,
            make: true,
            model: true,
            year: true,
            status: true,
          },
        },
      },
    })

    revalidatePath("/admin/assignments")

    return {
      success: true,
      assignment,
    }
  } catch (error) {
    console.error("Error creating assignment:", error)
    return {
      success: false,
      error: "Failed to create assignment",
    }
  }
}

export async function updateAssignmentStatus(assignmentId: string, status: string) {
  const session = await auth()

  if (!session) {
    throw new Error("Unauthorized")
  }

  try {
    const assignment = await prisma.vehicleAssignment.update({
      where: { id: assignmentId },
      data: {
        status: status as any,
        completedAt: status === "COMPLETED" ? new Date() : null,
      },
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
        vehicle: {
          select: {
            id: true,
            vin: true,
            make: true,
            model: true,
            year: true,
            status: true,
          },
        },
      },
    })

    revalidatePath("/admin/assignments")

    return {
      success: true,
      assignment,
    }
  } catch (error) {
    console.error("Error updating assignment status:", error)
    return {
      success: false,
      error: "Failed to update assignment status",
    }
  }
}

export async function deleteAssignment(assignmentId: string) {
  const session = await auth()

  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MANAGER")) {
    throw new Error("Unauthorized")
  }

  try {
    await prisma.vehicleAssignment.delete({
      where: { id: assignmentId },
    })

    revalidatePath("/admin/assignments")

    return {
      success: true,
    }
  } catch (error) {
    console.error("Error deleting assignment:", error)
    return {
      success: false,
      error: "Failed to delete assignment",
    }
  }
}
