"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { createAndSendNotification } from "@/lib/notification-service"
import { NotificationType } from "@/lib/notification-types"

const vehicleSchema = z.object({
  id: z.string().optional(),
  vin: z.string().length(17, "VIN must be 17 characters long"),
  stockNumber: z.string().optional().nullable(),
  year: z
    .number()
    .int()
    .min(1900, "Year must be 1900 or later")
    .max(new Date().getFullYear() + 1, "Year cannot be in the future"),
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  trim: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  mileage: z.number().int().min(0, "Mileage cannot be negative").optional().nullable(),
  status: z.enum([
    "IN_PROGRESS",
    "COMPLETED",
    "ON_HOLD",
    "CANCELED",
    "PENDING_INSPECTION",
    "AWAITING_PARTS",
    "READY_FOR_SALE",
  ]),
  currentLocation: z.string().optional().nullable(),
  assignedToId: z.string().optional().nullable(),
  reconditioningCost: z.number().min(0, "Cost cannot be negative").optional().nullable(),
  daysInRecon: z.number().int().min(0, "Days in recon cannot be negative").optional(),
})

const createVehicleSchema = vehicleSchema.omit({ id: true, daysInRecon: true }).extend({
  year: z.coerce
    .number()
    .int()
    .min(1900, "Year must be 1900 or later")
    .max(new Date().getFullYear() + 1, "Year cannot be in the future"),
  mileage: z.coerce.number().int().min(0, "Mileage cannot be negative").optional().nullable(),
  reconditioningCost: z.coerce.number().min(0, "Cost cannot be negative").optional().nullable(),
})

const updateVehicleSchema = vehicleSchema.partial().extend({
  id: z.string(),
  year: z.coerce
    .number()
    .int()
    .min(1900, "Year must be 1900 or later")
    .max(new Date().getFullYear() + 1, "Year cannot be in the future")
    .optional(),
  mileage: z.coerce.number().int().min(0, "Mileage cannot be negative").optional().nullable(),
  reconditioningCost: z.coerce.number().min(0, "Cost cannot be negative").optional().nullable(),
  daysInRecon: z.coerce.number().int().min(0, "Days in recon cannot be negative").optional(),
})

const timelineEventSchema = z.object({
  vehicleId: z.string(),
  eventType: z.string().min(1, "Event type is required"),
  description: z.string().optional().nullable(),
  department: z.string().optional().nullable(),
  userId: z.string().optional().nullable(),
})

export async function fetchVehicles(query = "", status?: string, assignedToId?: string, page = 1, limit = 10) {
  try {
    const offset = (page - 1) * limit
    const whereClause: any = {
      OR: [
        { vin: { contains: query, mode: "insensitive" } },
        { make: { contains: query, mode: "insensitive" } },
        { model: { contains: query, mode: "insensitive" } },
        { stockNumber: { contains: query, mode: "insensitive" } },
      ],
    }

    if (status && status !== "ALL") {
      whereClause.status = status
    }
    if (assignedToId && assignedToId !== "ALL") {
      whereClause.assignedToId = assignedToId
    }

    const vehicles = await prisma.vehicle.findMany({
      where: whereClause,
      include: {
        assignedTo: {
          select: { id: true, name: true, email: true },
        },
        timelineEvents: {
          orderBy: { timestamp: "desc" },
          take: 1, // Get the latest event for quick overview
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: offset,
      take: limit,
    })

    const totalVehicles = await prisma.vehicle.count({ where: whereClause })

    revalidatePath("/recon/cards")
    revalidatePath("/mobile")
    return { vehicles, totalPages: Math.ceil(totalVehicles / limit), currentPage: page, success: true }
  } catch (error) {
    console.error("Failed to fetch vehicles:", error)
    return { vehicles: [], totalPages: 0, currentPage: 1, success: false, message: "Failed to fetch vehicles." }
  }
}

export async function fetchVehicleById(id: string) {
  try {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      include: {
        assignedTo: {
          select: { id: true, name: true, email: true },
        },
        timelineEvents: {
          orderBy: { timestamp: "desc" },
          include: { user: { select: { id: true, name: true } } },
        },
      },
    })
    if (!vehicle) {
      return { success: false, message: "Vehicle not found." }
    }
    revalidatePath(`/recon/cards/${id}`)
    return { success: true, vehicle }
  } catch (error) {
    console.error(`Failed to fetch vehicle with ID ${id}:`, error)
    return { success: false, message: `Failed to fetch vehicle with ID ${id}.` }
  }
}

export async function fetchVehicleByVin(vin: string) {
  try {
    const vehicle = await prisma.vehicle.findUnique({
      where: { vin },
      include: {
        assignedTo: {
          select: { id: true, name: true, email: true },
        },
        timelineEvents: {
          orderBy: { timestamp: "desc" },
          include: { user: { select: { id: true, name: true } } },
        },
      },
    })
    if (!vehicle) {
      return { success: false, message: "Vehicle not found." }
    }
    revalidatePath(`/recon/cards`) // Revalidate general list
    revalidatePath(`/mobile`) // Revalidate mobile page
    return { success: true, vehicle }
  } catch (error) {
    console.error(`Failed to fetch vehicle with VIN ${vin}:`, error)
    return { success: false, message: `Failed to fetch vehicle with VIN ${vin}.` }
  }
}

export async function createVehicle(formData: FormData) {
  const data = Object.fromEntries(formData.entries())
  const parsed = createVehicleSchema.safeParse(data)

  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors }
  }

  const {
    vin,
    stockNumber,
    year,
    make,
    model,
    trim,
    color,
    mileage,
    status,
    currentLocation,
    assignedToId,
    reconditioningCost,
  } = parsed.data

  try {
    const newVehicle = await prisma.vehicle.create({
      data: {
        vin,
        stockNumber,
        year,
        make,
        model,
        trim,
        color,
        mileage,
        status,
        currentLocation,
        assignedToId: assignedToId || null,
        reconditioningCost,
        daysInRecon: 0, // New vehicles start with 0 days in recon
      },
    })

    await addTimelineEvent({
      vehicleId: newVehicle.id,
      eventType: "CHECK_IN",
      description: `Vehicle checked in. Initial status: ${newVehicle.status}.`,
      department: newVehicle.currentLocation || undefined,
      userId: newVehicle.assignedToId || undefined,
    })

    // Send notification for new vehicle check-in
    if (newVehicle.assignedToId) {
      await createAndSendNotification({
        userId: newVehicle.assignedToId,
        type: NotificationType.NEW_VEHICLE_CHECK_IN,
        message: `A new vehicle (${newVehicle.make} ${newVehicle.model}, VIN: ${newVehicle.vin}) has been assigned to you.`,
      })
    }

    revalidatePath("/recon/cards")
    revalidatePath("/mobile")
    return { success: true, message: "Vehicle created successfully.", vehicle: newVehicle }
  } catch (error: any) {
    if (error.code === "P2002" && error.meta?.target?.includes("vin")) {
      return {
        success: false,
        message: "A vehicle with this VIN already exists.",
        errors: { vin: ["This VIN already exists."] },
      }
    }
    console.error("Failed to create vehicle:", error)
    return { success: false, message: "Failed to create vehicle." }
  }
}

export async function updateVehicle(formData: FormData) {
  const data = Object.fromEntries(formData.entries())
  const parsed = updateVehicleSchema.safeParse(data)

  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors }
  }

  const {
    id,
    vin,
    stockNumber,
    year,
    make,
    model,
    trim,
    color,
    mileage,
    status,
    currentLocation,
    assignedToId,
    reconditioningCost,
    daysInRecon,
  } = parsed.data

  if (!id) {
    return { success: false, message: "Vehicle ID is required for update." }
  }

  try {
    const existingVehicle = await prisma.vehicle.findUnique({ where: { id } })
    if (!existingVehicle) {
      return { success: false, message: "Vehicle not found for update." }
    }

    const updatedVehicle = await prisma.vehicle.update({
      where: { id },
      data: {
        vin,
        stockNumber,
        year,
        make,
        model,
        trim,
        color,
        mileage,
        status,
        currentLocation,
        assignedToId: assignedToId || null,
        reconditioningCost,
        daysInRecon,
      },
    })

    // Add timeline events for significant changes
    if (status && status !== existingVehicle.status) {
      await addTimelineEvent({
        vehicleId: updatedVehicle.id,
        eventType: "STATUS_CHANGE",
        description: `Status changed from ${existingVehicle.status} to ${updatedVehicle.status}.`,
        userId: updatedVehicle.assignedToId || undefined,
      })

      // Send notifications based on status change
      if (status === "COMPLETED" && updatedVehicle.assignedToId) {
        await createAndSendNotification({
          userId: updatedVehicle.assignedToId,
          type: NotificationType.VEHICLE_COMPLETED,
          message: `Vehicle (${updatedVehicle.make} ${updatedVehicle.model}, VIN: ${updatedVehicle.vin}) has been marked as COMPLETED.`,
        })
      } else if (status === "ON_HOLD" && updatedVehicle.assignedToId) {
        await createAndSendNotification({
          userId: updatedVehicle.assignedToId,
          type: NotificationType.VEHICLE_ON_HOLD,
          message: `Vehicle (${updatedVehicle.make} ${updatedVehicle.model}, VIN: ${updatedVehicle.vin}) is now ON HOLD.`,
        })
      } else if (existingVehicle.status === "ON_HOLD" && status === "IN_PROGRESS" && updatedVehicle.assignedToId) {
        await createAndSendNotification({
          userId: updatedVehicle.assignedToId,
          type: NotificationType.VEHICLE_BACK_IN_PROGRESS,
          message: `Vehicle (${updatedVehicle.make} ${updatedVehicle.model}, VIN: ${updatedVehicle.vin}) is back IN PROGRESS.`,
        })
      }
    }

    if (currentLocation && currentLocation !== existingVehicle.currentLocation) {
      await addTimelineEvent({
        vehicleId: updatedVehicle.id,
        eventType: "LOCATION_CHANGE",
        description: `Location changed from ${existingVehicle.currentLocation || "N/A"} to ${updatedVehicle.currentLocation || "N/A"}.`,
        department: updatedVehicle.currentLocation || undefined,
        userId: updatedVehicle.assignedToId || undefined,
      })
    }

    if (assignedToId && assignedToId !== existingVehicle.assignedToId) {
      await addTimelineEvent({
        vehicleId: updatedVehicle.id,
        eventType: "ASSIGNMENT_UPDATE",
        description: `Assigned from ${existingVehicle.assignedToId ? `user ID ${existingVehicle.assignedToId}` : "unassigned"} to ${assignedToId ? `user ID ${assignedToId}` : "unassigned"}.`,
        userId: updatedVehicle.assignedToId || undefined,
      })
      // Notify new assignee
      if (assignedToId) {
        await createAndSendNotification({
          userId: assignedToId,
          type: NotificationType.ASSIGNMENT_UPDATE,
          message: `You have been assigned vehicle (${updatedVehicle.make} ${updatedVehicle.model}, VIN: ${updatedVehicle.vin}).`,
        })
      }
    }

    revalidatePath("/recon/cards")
    revalidatePath(`/recon/cards/${id}`)
    revalidatePath("/mobile")
    return { success: true, message: "Vehicle updated successfully.", vehicle: updatedVehicle }
  } catch (error: any) {
    if (error.code === "P2002" && error.meta?.target?.includes("vin")) {
      return {
        success: false,
        message: "A vehicle with this VIN already exists.",
        errors: { vin: ["This VIN already exists."] },
      }
    }
    console.error("Failed to update vehicle:", error)
    return { success: false, message: "Failed to update vehicle." }
  }
}

export async function deleteVehicle(id: string) {
  try {
    await prisma.vehicle.delete({
      where: { id },
    })
    revalidatePath("/recon/cards")
    revalidatePath("/mobile")
    return { success: true, message: "Vehicle deleted successfully." }
  } catch (error) {
    console.error("Failed to delete vehicle:", error)
    return { success: false, message: "Failed to delete vehicle." }
  }
}

export async function updateVehicleStatus(id: string, newStatus: string) {
  try {
    const existingVehicle = await prisma.vehicle.findUnique({ where: { id } })
    if (!existingVehicle) {
      return { success: false, message: "Vehicle not found." }
    }

    if (
      ![
        "IN_PROGRESS",
        "COMPLETED",
        "ON_HOLD",
        "CANCELED",
        "PENDING_INSPECTION",
        "AWAITING_PARTS",
        "READY_FOR_SALE",
      ].includes(newStatus)
    ) {
      return { success: false, message: "Invalid status provided." }
    }

    const updatedVehicle = await prisma.vehicle.update({
      where: { id },
      data: { status: newStatus },
    })

    await addTimelineEvent({
      vehicleId: updatedVehicle.id,
      eventType: "STATUS_CHANGE",
      description: `Status changed from ${existingVehicle.status} to ${newStatus}.`,
      userId: updatedVehicle.assignedToId || undefined,
    })

    // Send notifications based on status change
    if (newStatus === "COMPLETED" && updatedVehicle.assignedToId) {
      await createAndSendNotification({
        userId: updatedVehicle.assignedToId,
        type: NotificationType.VEHICLE_COMPLETED,
        message: `Vehicle (${updatedVehicle.make} ${updatedVehicle.model}, VIN: ${updatedVehicle.vin}) has been marked as COMPLETED.`,
      })
    } else if (newStatus === "ON_HOLD" && updatedVehicle.assignedToId) {
      await createAndSendNotification({
        userId: updatedVehicle.assignedToId,
        type: NotificationType.VEHICLE_ON_HOLD,
        message: `Vehicle (${updatedVehicle.make} ${updatedVehicle.model}, VIN: ${updatedVehicle.vin}) is now ON HOLD.`,
      })
    } else if (existingVehicle.status === "ON_HOLD" && newStatus === "IN_PROGRESS" && updatedVehicle.assignedToId) {
      await createAndSendNotification({
        userId: updatedVehicle.assignedToId,
        type: NotificationType.VEHICLE_BACK_IN_PROGRESS,
        message: `Vehicle (${updatedVehicle.make} ${updatedVehicle.model}, VIN: ${updatedVehicle.vin}) is back IN PROGRESS.`,
      })
    }

    revalidatePath("/recon/cards")
    revalidatePath("/mobile")
    return { success: true, message: `Vehicle status updated to ${newStatus}.`, vehicle: updatedVehicle }
  } catch (error) {
    console.error("Failed to update vehicle status:", error)
    return { success: false, message: "Failed to update vehicle status." }
  }
}

export async function addTimelineEvent(data: z.infer<typeof timelineEventSchema>) {
  const parsed = timelineEventSchema.safeParse(data)

  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors }
  }

  const { vehicleId, eventType, description, department, userId } = parsed.data

  try {
    const newEvent = await prisma.timelineEvent.create({
      data: {
        vehicleId,
        eventType,
        description,
        department,
        userId,
      },
    })
    revalidatePath(`/recon/cards/${vehicleId}`)
    revalidatePath("/timeline")
    revalidatePath("/mobile")
    return { success: true, message: "Timeline event added successfully.", event: newEvent }
  } catch (error) {
    console.error("Failed to add timeline event:", error)
    return { success: false, message: "Failed to add timeline event." }
  }
}

export async function fetchTimelineEvents(
  vehicleId?: string,
  userId?: string,
  eventType?: string,
  page = 1,
  limit = 10,
) {
  try {
    const offset = (page - 1) * limit
    const whereClause: any = {}
    if (vehicleId) {
      whereClause.vehicleId = vehicleId
    }
    if (userId) {
      whereClause.userId = userId
    }
    if (eventType && eventType !== "ALL") {
      whereClause.eventType = eventType
    }

    const events = await prisma.timelineEvent.findMany({
      where: whereClause,
      include: {
        vehicle: {
          select: { id: true, vin: true, make: true, model: true },
        },
        user: {
          select: { id: true, name: true },
        },
      },
      orderBy: {
        timestamp: "desc",
      },
      skip: offset,
      take: limit,
    })

    const totalEvents = await prisma.timelineEvent.count({ where: whereClause })

    revalidatePath("/timeline")
    return { events, totalPages: Math.ceil(totalEvents / limit), currentPage: page, success: true }
  } catch (error) {
    console.error("Failed to fetch timeline events:", error)
    return { events: [], totalPages: 0, currentPage: 1, success: false, message: "Failed to fetch timeline events." }
  }
}
