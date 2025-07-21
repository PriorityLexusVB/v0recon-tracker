import nodemailer from "nodemailer"

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

// Configure your email transporter
// For production, use environment variables for sensitive credentials
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.ethereal.email", // Example: smtp.sendgrid.net
  port: Number.parseInt(process.env.EMAIL_PORT || "587"), // Example: 587 or 465
  secure: process.env.EMAIL_SECURE === "true", // Use 'true' if port is 465 (SSL)
  auth: {
    user: process.env.EMAIL_USER || "example@ethereal.email", // Your email username
    pass: process.env.EMAIL_PASSWORD || "password", // Your email password
  },
})

// This function sends the actual email using Nodemailer
async function sendEmail(options: { to: string; subject: string; html: string; from?: string }) {
  try {
    const mailOptions = {
      from: options.from || process.env.EMAIL_FROM || "noreply@recontracker.com",
      to: options.to,
      subject: options.subject,
      html: options.html,
    }

    const info = await transporter.sendMail(mailOptions)
    console.log("Email sent: %s", info.messageId)
    // Preview only available when sending through an Ethereal account
    if (process.env.NODE_ENV === "development" && process.env.EMAIL_HOST === "smtp.ethereal.email") {
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info))
    }
    return { success: true, message: "Email sent successfully", messageId: info.messageId }
  } catch (error) {
    console.error("Error sending email:", error)
    throw new Error(`Failed to send email: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

// This is the public facing function used by other parts of the app
export async function sendEmailNotification(notification: EmailNotification) {
  try {
    // You can add logic here to format the message based on type
    const htmlMessage = `
      <div style="font-family: sans-serif; line-height: 1.6;">
        <h2>${notification.subject}</h2>
        <p>${notification.message}</p>
        <p>Thank you for using Recon Tracker!</p>
      </div>
    `
    const result = await sendEmail({
      to: notification.to,
      subject: notification.subject,
      html: htmlMessage,
    })
    return result
  } catch (error) {
    console.error("Email service error:", error)
    return {
      success: false,
      message: `Failed to send email: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
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
  const results = await Promise.allSettled(notifications.map((notification) => sendEmailNotification(notification)))

  const successfulSends = results.filter((r) => r.status === "fulfilled" && r.value.success).length
  const failedSends = results.length - successfulSends

  if (failedSends > 0) {
    console.warn(`Sent ${successfulSends} emails successfully, ${failedSends} failed.`)
  }

  return {
    success: failedSends === 0,
    message: `Attempted to send ${notifications.length} emails. ${successfulSends} succeeded, ${failedSends} failed.`,
    results: results.map((r, index) => ({
      recipient: notifications[index].to,
      success: r.status === "fulfilled" && r.value.success,
      message:
        r.status === "fulfilled" ? r.value.message : r.reason instanceof Error ? r.reason.message : "Unknown error",
    })),
  }
}
