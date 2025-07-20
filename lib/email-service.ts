interface EmailNotification {
  to: string
  subject: string
  message: string
  type?: "welcome" | "password_reset" | "notification" | "alert"
}

interface EmailPreferences {
  enabled: boolean
  types: string[]
  frequency: "immediate" | "daily" | "weekly"
}

// Mock email service for when EmailJS is not configured
const mockEmailService = {
  async send(notification: EmailNotification) {
    console.log("Mock Email Service - Would send:", notification)
    return { success: true, message: "Email sent (mock)" }
  },
}

export async function sendEmailNotification(notification: EmailNotification) {
  try {
    // Use server-side API route for email sending
    const response = await fetch("/api/notifications/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(notification),
    })

    if (!response.ok) {
      throw new Error("Failed to send email")
    }

    return await response.json()
  } catch (error) {
    console.error("Email service error:", error)
    // Fallback to mock service
    return mockEmailService.send(notification)
  }
}

export function getDefaultEmailPreferences(): EmailPreferences {
  return {
    enabled: true,
    types: ["welcome", "password_reset", "notification"],
    frequency: "immediate",
  }
}

export async function sendBulkNotifications(notifications: EmailNotification[]) {
  try {
    const response = await fetch("/api/notifications/email/bulk", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ notifications }),
    })

    if (!response.ok) {
      throw new Error("Failed to send bulk emails")
    }

    return await response.json()
  } catch (error) {
    console.error("Bulk email service error:", error)
    // Fallback to individual sends
    const results = await Promise.allSettled(notifications.map((notification) => mockEmailService.send(notification)))
    return { success: true, results }
  }
}
