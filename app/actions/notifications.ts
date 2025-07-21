"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { NotificationType, NotificationStatus } from "@/lib/notification-types"

const notificationSchema = z.object({
  userId: z.string().min(1, "User ID is required."),
  type: z.nativeEnum(NotificationType),
  message: z.string().min(1, "Message is required."),
  metadata: z.record(z.any()).optional().nullable(),
  status: z.nativeEnum(NotificationStatus).default(NotificationStatus.PENDING),
})

export async function fetchNotifications(userId?: string, status?: NotificationStatus, page = 1, limit = 10) {
  try {
    const offset = (page - 1) * limit
    const whereClause: any = {}

    if (userId) {
      whereClause.userId = userId
    }
    if (status && status !== "ALL") {
      whereClause.status = status
    }

    const notifications = await prisma.notification.findMany({
      where: whereClause,
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: offset,
      take: limit,
    })

    const totalNotifications = await prisma.notification.count({ where: whereClause })

    revalidatePath("/notifications")
    return { notifications, totalPages: Math.ceil(totalNotifications / limit), currentPage: page, success: true }
  } catch (error) {
    console.error("Failed to fetch notifications:", error)
    return {
      notifications: [],
      totalPages: 0,
      currentPage: 1,
      success: false,
      message: "Failed to fetch notifications.",
    }
  }
}

export async function markNotificationAsRead(notificationId: string) {
  try {
    const notification = await prisma.notification.update({
      where: { id: notificationId },
      data: { status: NotificationStatus.READ, readAt: new Date() },
    })
    revalidatePath("/notifications")
    return { success: true, message: "Notification marked as read.", notification }
  } catch (error) {
    console.error("Failed to mark notification as read:", error)
    return { success: false, message: "Failed to mark notification as read." }
  }
}

export async function markAllNotificationsAsRead(userId: string) {
  try {
    await prisma.notification.updateMany({
      where: {
        userId: userId,
        status: { not: NotificationStatus.READ },
      },
      data: { status: NotificationStatus.READ, readAt: new Date() },
    })
    revalidatePath("/notifications")
    return { success: true, message: "All notifications marked as read." }
  } catch (error) {
    console.error("Failed to mark all notifications as read:", error)
    return { success: false, message: "Failed to mark all notifications as read." }
  }
}

export async function deleteNotification(notificationId: string) {
  try {
    await prisma.notification.delete({
      where: { id: notificationId },
    })
    revalidatePath("/notifications")
    return { success: true, message: "Notification deleted successfully." }
  } catch (error) {
    console.error("Failed to delete notification:", error)
    return { success: false, message: "Failed to delete notification." }
  }
}

export async function createNotification(data: z.infer<typeof notificationSchema>) {
  const parsed = notificationSchema.safeParse(data)

  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors, message: "Validation failed." }
  }

  try {
    const newNotification = await prisma.notification.create({
      data: {
        userId: parsed.data.userId,
        type: parsed.data.type,
        message: parsed.data.message,
        metadata: parsed.data.metadata || undefined,
        status: parsed.data.status,
      },
    })
    revalidatePath("/notifications")
    return { success: true, message: "Notification created successfully.", notification: newNotification }
  } catch (error) {
    console.error("Failed to create notification:", error)
    return { success: false, message: "Failed to create notification." }
  }
}
