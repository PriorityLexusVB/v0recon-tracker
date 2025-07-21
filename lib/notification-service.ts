import { prisma } from "@/lib/prisma"
import { sendEmailNotification } from "@/lib/email-service"
import { sendSmsNotification } from "@/lib/sms-service" // Assuming you'll create this
import { type NotificationType, NotificationStatus } from "@/lib/notification-types"
import type { Notification } from "@/lib/types"

interface CreateNotificationOptions {
  userId: string
  type: NotificationType
  message: string
  metadata?: Record<string, any> | null
}

export async function createAndSendNotification(
  options: CreateNotificationOptions,
): Promise<{ success: boolean; message: string; notification?: Notification }> {
  const { userId, type, message, metadata } = options

  try {
    // 1. Create notification record in the database
    const newNotification = await prisma.notification.create({
      data: {
        userId,
        type,
        message,
        metadata: metadata || undefined,
        status: NotificationStatus.PENDING, // Initial status
      },
    })

    // 2. Fetch user's notification preferences (if implemented)
    // For now, assume all users want all notifications immediately
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, phoneNumber: true, name: true },
    })

    if (!user) {
      console.warn(`User with ID ${userId} not found for notification.`)
      await prisma.notification.update({
        where: { id: newNotification.id },
        data: { status: NotificationStatus.FAILED, errorMessage: "User not found" },
      })
      return { success: false, message: "User not found for notification." }
    }

    let emailSent = false
    let smsSent = false
    const errorMessage: string[] = []

    // 3. Send email notification if user has email and preferences allow
    if (user.email) {
      try {
        const emailResult = await sendEmailNotification({
          to: user.email,
          subject: `Recon Tracker Notification: ${type.replace(/_/g, " ")}`,
          message: message,
          type: type.toLowerCase() as any, // Cast to match EmailNotification type
        })
        if (emailResult.success) {
          emailSent = true
        } else {
          errorMessage.push(`Email failed: ${emailResult.message}`)
        }
      } catch (emailError) {
        errorMessage.push(
          `Email exception: ${emailError instanceof Error ? emailError.message : "Unknown email error"}`,
        )
        console.error("Error sending email notification:", emailError)
      }
    }

    // 4. Send SMS notification if user has phone number and preferences allow
    if (user.phoneNumber && process.env.SMS_ENABLED === "true") {
      // Check if SMS is globally enabled
      try {
        const smsResult = await sendSmsNotification({
          to: user.phoneNumber,
          message: `Recon Tracker: ${message}`,
        })
        if (smsResult.success) {
          smsSent = true
        } else {
          errorMessage.push(`SMS failed: ${smsResult.message}`)
        }
      } catch (smsError) {
        errorMessage.push(`SMS exception: ${smsError instanceof Error ? smsError.message : "Unknown SMS error"}`)
        console.error("Error sending SMS notification:", smsError)
      }
    }

    // 5. Update notification status based on delivery attempts
    let finalStatus = NotificationStatus.SENT
    let finalErrorMessage: string | null = null

    if (!emailSent && !smsSent) {
      finalStatus = NotificationStatus.FAILED
      finalErrorMessage = errorMessage.join("; ") || "No delivery methods succeeded."
    } else if (errorMessage.length > 0) {
      // Partial success, but some methods failed
      finalErrorMessage = errorMessage.join("; ")
    }

    await prisma.notification.update({
      where: { id: newNotification.id },
      data: {
        status: finalStatus,
        errorMessage: finalErrorMessage,
        sentAt: new Date(),
      },
    })

    return { success: true, message: "Notification processed.", notification: newNotification }
  } catch (error) {
    console.error("Failed to create and send notification:", error)
    return {
      success: false,
      message: `Failed to create and send notification: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}
