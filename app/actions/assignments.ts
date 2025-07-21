"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { createAndSendNotification } from "@/lib/notification-service"
import { NotificationType } from "@/lib/notification-types"

const assignmentSchema = z.object({
  id: z.string().optional(),
  vehicleId: z.string().min(1, "Vehicle is required"),
  assignedToId: z.string().min(1, "Assignee is required"),
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELED"]).default("PENDING"),
  dueDate: z.string().datetime().optional().nullable(),
  notes: z.string().optional().nullable(),
})

export async function fetchAssignments(query = "", page = 1, limit = 10) {
  try {
    const offset = (page - 1) * limit
    const whereClause: any = {
      OR: [
        { vehicle: { vin: { contains: query, mode: "insensitive" } } },
        { vehicle: { make: { contains: query, mode: "insensitive" } } },
        { vehicle: { model: { contains: query, mode: "insensitive" } } },
        { assignedTo: { name: { contains: query, mode: "insensitive" } } },
      ],
    }

    const assignments = await prisma.assignment.findMany({
      where: whereClause,
      include: {
        vehicle: {
          select: { id: true, vin: true, make: true, model: true, year: true, stockNumber: true },
        },
        assignedTo: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: offset,
      take: limit,
    })

    const totalAssignments = await prisma.assignment.count({ where: whereClause })

    revalidatePath("/admin/assignments")
    return { assignments, totalPages: Math.ceil(totalAssignments / limit), currentPage: page, success: true }
  } catch (error) {
    console.error("Failed to fetch assignments:", error)
    return { assignments: [], totalPages: 0, currentPage: 1, success: false, message: "Failed to fetch assignments." }
  }
}

export async function createAssignment(formData: FormData) {
  const data = Object.fromEntries(formData.entries())
  const parsed = assignmentSchema.safeParse(data)

  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors, message: "Validation failed." }
  }

  const { vehicleId, assignedToId, status, dueDate, notes } = parsed.data

  try {
    const newAssignment = await prisma.assignment.create({
      data: {
        vehicleId,
        assignedToId,
        status,
        dueDate: dueDate ? new Date(dueDate) : null,
        notes,
      },
    })

    // Update vehicle's assignedToId and status if applicable
    await prisma.vehicle.update({
      where: { id: vehicleId },
      data: {
        assignedToId: assignedToId,
        // Optionally update vehicle status based on assignment status
        // status: status === "PENDING" ? "PENDING_INSPECTION" : status === "IN_PROGRESS" ? "IN_PROGRESS" : undefined,
      },
    })

    // Send notification to the assigned user
    await createAndSendNotification({
      userId: assignedToId,
      type: NotificationType.ASSIGNMENT_UPDATE,
      message: `You have a new assignment for VIN: ${newAssignment.vehicleId}. Status: ${newAssignment.status}.`,
      metadata: { assignmentId: newAssignment.id, vehicleId: newAssignment.vehicleId },
    })

    revalidatePath("/admin/assignments")
    revalidatePath("/recon/cards") // Revalidate vehicle list as assignment might affect display
    return { success: true, message: "Assignment created successfully.", assignment: newAssignment }
  } catch (error) {
    console.error("Failed to create assignment:", error)
    return { success: false, message: "Failed to create assignment." }
  }
}

export async function updateAssignment(formData: FormData) {
  const data = Object.fromEntries(formData.entries())
  const parsed = assignmentSchema.safeParse(data)

  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors, message: "Validation failed." }
  }

  const { id, vehicleId, assignedToId, status, dueDate, notes } = parsed.data

  if (!id) {
    return { success: false, message: "Assignment ID is required for update." }
  }

  try {
    const existingAssignment = await prisma.assignment.findUnique({ where: { id } })
    if (!existingAssignment) {
      return { success: false, message: "Assignment not found." }
    }

    const updatedAssignment = await prisma.assignment.update({
      where: { id },
      data: {
        vehicleId,
        assignedToId,
        status,
        dueDate: dueDate ? new Date(dueDate) : null,
        notes,
      },
    })

    // Update vehicle's assignedToId and status if applicable
    await prisma.vehicle.update({
      where: { id: vehicleId },
      data: {
        assignedToId: assignedToId,
        // status: status === "COMPLETED" ? "READY_FOR_SALE" : status === "IN_PROGRESS" ? "IN_PROGRESS" : undefined,
      },
    })

    // Send notification if assignee changed
    if (assignedToId !== existingAssignment.assignedToId) {
      await createAndSendNotification({
        userId: assignedToId,
        type: NotificationType.ASSIGNMENT_UPDATE,
        message: `You have been assigned a new task for VIN: ${updatedAssignment.vehicleId}.`,
        metadata: { assignmentId: updatedAssignment.id, vehicleId: updatedAssignment.vehicleId },
      })
      // Optionally notify old assignee
      if (existingAssignment.assignedToId) {
        await createAndSendNotification({
          userId: existingAssignment.assignedToId,
          type: NotificationType.ASSIGNMENT_UPDATE,
          message: `An assignment for VIN: ${updatedAssignment.vehicleId} has been reassigned from you.`,
          metadata: { assignmentId: updatedAssignment.id, vehicleId: updatedAssignment.vehicleId },
        })
      }
    }

    // Send notification if status changed to completed
    if (status === "COMPLETED" && existingAssignment.status !== "COMPLETED") {
      await createAndSendNotification({
        userId: assignedToId,
        type: NotificationType.VEHICLE_COMPLETED,
        message: `Your assignment for VIN: ${updatedAssignment.vehicleId} is now COMPLETED.`,
        metadata: { assignmentId: updatedAssignment.id, vehicleId: updatedAssignment.vehicleId },
      })
    }

    revalidatePath("/admin/assignments")
    revalidatePath("/recon/cards")
    return { success: true, message: "Assignment updated successfully.", assignment: updatedAssignment }
  } catch (error) {
    console.error("Failed to update assignment:", error)
    return { success: false, message: "Failed to update assignment." }
  }
}

export async function deleteAssignment(id: string) {
  try {
    await prisma.assignment.delete({
      where: { id },
    })
    revalidatePath("/admin/assignments")
    revalidatePath("/recon/cards")
    return { success: true, message: "Assignment deleted successfully." }
  } catch (error) {
    console.error("Failed to delete assignment:", error)
    return { success: false, message: "Failed to delete assignment." }
  }
}
