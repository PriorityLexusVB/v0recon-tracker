import { prisma } from "./prisma"
import { sendEmailNotification } from "./email-service"
import { type NotificationType, NotificationStatus } from "./notification-types" // Assuming these types are defined

interface CreateNotificationPayload {
  userId: string
  type: NotificationType
  message: string
  metadata?: Record<string, any> // Optional metadata for context
}

export async function createAndSendNotification(payload: CreateNotificationPayload) {
  const { userId, type, message, metadata } = payload

  try {
    // 1. Create notification record in DB
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        message,
        read: false,
        status: NotificationStatus.PENDING,
      },
    })

    // 2. Fetch user details for sending (e.g., email, preferences)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true }, // Select only necessary fields
    })

    if (!user) {
      console.warn(`User with ID ${userId} not found for notification.`)
      await prisma.notification.update({
        where: { id: notification.id },
        data: { status: NotificationStatus.FAILED, message: `${message} (User not found)` },
      })
      return { success: false, message: "User not found for notification." }
    }

    // 3. Determine notification channels based on user preferences (future enhancement)
    // For now, always attempt email if email exists
    if (user.email) {
      const emailSubject = `Recon Tracker: ${type.replace(/_/g, " ")}` // Basic subject formatting
      const emailResult = await sendEmailNotification({
        to: user.email,
        subject: emailSubject,
        message: message,
        type: type,
      })

      // 4. Update notification status based on send result
      await prisma.notification.update({
        where: { id: notification.id },
        data: { status: emailResult.success ? NotificationStatus.SENT : NotificationStatus.FAILED },
      })

      if (!emailResult.success) {
        console.error(`Failed to send email for notification ${notification.id}: ${emailResult.message}`)
        return { success: false, message: `Failed to send email: ${emailResult.message}` }
      }
    } else {
      // If no email or other channels, mark as sent if no action needed, or failed if email was expected
      await prisma.notification.update({
        where: { id: notification.id },
        data: { status: NotificationStatus.SENT, message: `${message} (No email configured)` },
      })
    }

    return { success: true, message: "Notification created and sent successfully." }
  } catch (error) {
    console.error("Error in createAndSendNotification:", error)
    return {
      success: false,
      message: `Failed to create and send notification: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}

export async function markNotificationAsRead(notificationId: string) {
  try {
    await prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    })
    return { success: true, message: "Notification marked as read." }
  } catch (error) {
    console.error(`Error marking notification ${notificationId} as read:`, error)
    return {
      success: false,
      message: `Failed to mark notification as read: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}

export async function getUnreadNotificationsCount(userId: string) {
  try {
    const count = await prisma.notification.count({
      where: {
        userId: userId,
        read: false,
      },
    })
    return { success: true, count }
  } catch (error) {
    console.error(`Error getting unread notifications count for user ${userId}:`, error)
    return {
      success: false,
      count: 0,
      message: `Failed to get unread count: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}

export async function getNotificationsForUser(userId: string, page = 1, pageSize = 10) {
  try {
    const skip = (page - 1) * pageSize
    const notifications = await prisma.notification.findMany({
      where: { userId: userId },
      orderBy: { createdAt: "desc" },
      skip: skip,
      take: pageSize,
    })
    const total = await prisma.notification.count({ where: { userId: userId } })
    return { success: true, notifications, total, page, pageSize }
  } catch (error) {
    console.error(`Error fetching notifications for user ${userId}:`, error)
    return {
      success: false,
      notifications: [],
      total: 0,
      page,
      pageSize,
      message: `Failed to fetch notifications: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}
