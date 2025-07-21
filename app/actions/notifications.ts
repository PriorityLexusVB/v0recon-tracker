"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { sendEmailNotification, sendBulkNotifications } from "@/lib/email-service"

const notificationSchema = z.object({
  id: z.string().optional(),
  userId: z.string(),
  type: z.string().min(1, "Notification type is required"),
  message: z.string().min(1, "Message is required"),
  read: z.boolean().optional(),
  status: z.string().optional(),
})

const createNotificationSchema = notificationSchema.omit({ id: true, read: true, status: true })
const updateNotificationSchema = notificationSchema.extend({ id: z.string() }).partial()

export async function fetchNotifications(userId?: string, read?: boolean, page = 1, limit = 10) {
  try {
    const offset = (page - 1) * limit
    const whereClause: any = {}
    if (userId) {
      whereClause.userId = userId
    }
    if (read !== undefined) {
      whereClause.read = read
    }

    const notifications = await prisma.notification.findMany({
      where: whereClause,
      orderBy: {
        createdAt: "desc",
      },
      skip: offset,
      take: limit,
    })

    const totalNotifications = await prisma.notification.count({
      where: whereClause,
    })

    revalidatePath("/notifications")
    return { notifications, totalPages: Math.ceil(totalNotifications / limit), currentPage: page }
  } catch (error) {
    console.error("Failed to fetch notifications:", error)
    throw new Error("Failed to fetch notifications.")
  }
}

export async function createNotification(data: z.infer<typeof createNotificationSchema>) {
  const parsed = createNotificationSchema.safeParse(data)

  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors }
  }

  const { userId, type, message } = parsed.data

  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        message,
        status: "PENDING", // Initial status
      },
    })

    // Attempt to send email notification if user has email preferences enabled
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (user?.email) {
      const emailResult = await sendEmailNotification({
        to: user.email,
        subject: `Recon Tracker: ${type.replace(/_/g, " ")}`,
        message: message,
        type: type as any, // Cast to known types if applicable
      })

      await prisma.notification.update({
        where: { id: notification.id },
        data: { status: emailResult.success ? "SENT" : "FAILED" },
      })
    }

    revalidatePath("/notifications")
    return { success: true, message: "Notification created and sent successfully.", notification }
  } catch (error) {
    console.error("Failed to create notification:", error)
    return { success: false, message: "Failed to create notification." }
  }
}

export async function updateNotification(data: z.infer<typeof updateNotificationSchema>) {
  const parsed = updateNotificationSchema.safeParse(data)

  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors }
  }

  const { id, read, status } = parsed.data

  if (!id) {
    return { success: false, message: "Notification ID is required for update." }
  }

  try {
    const updatedNotification = await prisma.notification.update({
      where: { id },
      data: { read, status },
    })
    revalidatePath("/notifications")
    return { success: true, message: "Notification updated successfully.", notification: updatedNotification }
  } catch (error) {
    console.error("Failed to update notification:", error)
    return { success: false, message: "Failed to update notification." }
  }
}

export async function markNotificationAsRead(id: string) {
  try {
    await prisma.notification.update({
      where: { id },
      data: { read: true },
    })
    revalidatePath("/notifications")
    return { success: true, message: "Notification marked as read." }
  } catch (error) {
    console.error("Failed to mark notification as read:", error)
    throw new Error("Failed to mark notification as read.")
  }
}

export async function deleteNotification(id: string) {
  try {
    await prisma.notification.delete({
      where: { id },
    })
    revalidatePath("/notifications")
    return { success: true, message: "Notification deleted successfully." }
  } catch (error) {
    console.error("Failed to delete notification:", error)
    throw new Error("Failed to delete notification.")
  }
}

export async function sendBulkNotificationsAction(
  notificationsData: { userId: string; type: string; message: string }[],
) {
  const notificationsToCreate = notificationsData.map((data) => createNotificationSchema.parse(data))

  try {
    const createdNotifications = await prisma.$transaction(
      notificationsToCreate.map((data) => prisma.notification.create({ data: { ...data, status: "PENDING" } })),
    )

    const emailNotifications = await Promise.all(
      createdNotifications.map(async (notification) => {
        const user = await prisma.user.findUnique({ where: { id: notification.userId } })
        if (user?.email) {
          return {
            to: user.email,
            subject: `Recon Tracker: ${notification.type.replace(/_/g, " ")}`,
            message: notification.message,
            type: notification.type as any,
          }
        }
        return null
      }),
    )

    const validEmailNotifications = emailNotifications.filter(Boolean) as z.infer<typeof createNotificationSchema>[]

    const bulkEmailResult = await sendBulkNotifications(validEmailNotifications)

    // Update status based on bulk email result
    await Promise.all(
      createdNotifications.map(async (notification) => {
        const emailSentForThisNotification = bulkEmailResult.results?.find(
          (r) => r.recipient === (notification as any).user?.email,
        ) // This part needs refinement if `sendBulkNotifications` doesn't return per-recipient status
        await prisma.notification.update({
          where: { id: notification.id },
          data: { status: emailSentForThisNotification?.success ? "SENT" : "FAILED" },
        })
      }),
    )

    revalidatePath("/notifications")
    return { success: true, message: "Bulk notifications processed.", bulkEmailResult }
  } catch (error) {
    console.error("Failed to send bulk notifications:", error)
    return { success: false, message: "Failed to send bulk notifications." }
  }
}
