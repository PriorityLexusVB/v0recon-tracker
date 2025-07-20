import { toast } from "sonner"
import { useNotificationStore } from "./notification-store"
import { sendEmailNotification } from "./email-service" // Import sendEmailNotification
import type { NotificationType, NotificationLevel } from "./notification-types"
import type { NotificationPreferences } from "./notification-types"

export class NotificationService {
  private static instance: NotificationService
  private preferences: NotificationPreferences

  private constructor() {
    this.preferences = this.loadPreferences()
    this.requestBrowserPermission()
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService()
    }
    return NotificationService.instance
  }

  private async requestBrowserPermission(): Promise<void> {
    if ("Notification" in window && Notification.permission === "default") {
      await Notification.requestPermission()
    }
  }

  private loadPreferences(): NotificationPreferences {
    if (typeof window === "undefined") {
      return this.getDefaultPreferences()
    }

    try {
      const stored = localStorage.getItem("notification-preferences")
      return stored ? JSON.parse(stored) : this.getDefaultPreferences()
    } catch {
      return this.getDefaultPreferences()
    }
  }

  private getDefaultPreferences(): NotificationPreferences {
    return {
      email: {
        enabled: false,
        recipientEmail: "",
        recipientName: "",
        serviceId: "",
        templateId: "",
        publicKey: "8fA1IBx-0m7txkdTD", // Your provided EmailJS public key
      },
      browser: {
        enabled: true,
      },
      webhook: {
        enabled: false,
        url: "",
      },
    }
  }

  updatePreferences(newPreferences: Partial<NotificationPreferences>): void {
    this.preferences = { ...this.preferences, ...newPreferences }
    if (typeof window !== "undefined") {
      localStorage.setItem("notification-preferences", JSON.stringify(this.preferences))
    }
  }

  getPreferences(): NotificationPreferences {
    return { ...this.preferences }
  }

  async sendTimelineAlert(alert: {
    vehicleInfo: string
    vin: string
    step: string
    type: "warning" | "overdue"
    currentDays: number
    targetDays: number
    message: string
  }): Promise<void> {
    const isCritical = alert.type === "overdue" || alert.currentDays >= alert.targetDays * 1.5

    // Send browser notification (always free)
    if (this.preferences.browser.enabled && (!this.preferences.browser.enabled || isCritical)) {
      this.sendBrowserNotification(alert)
    }

    // Send email notification via EmailJS (free tier)
    if (
      this.preferences.email.enabled &&
      (!this.preferences.email.enabled || isCritical) &&
      this.preferences.email.recipientEmail &&
      this.preferences.email.serviceId &&
      this.preferences.email.templateId &&
      this.preferences.email.publicKey
    ) {
      await this.sendEmailJSNotification(alert)
    }

    // Send webhook notification (free for Discord, Slack, etc.)
    if (
      this.preferences.webhook.enabled &&
      (!this.preferences.webhook.enabled || isCritical) &&
      this.preferences.webhook.url
    ) {
      await this.sendWebhookNotification(alert)
    }

    // Schedule escalation if enabled and critical
    if (this.preferences.escalation.enabled && isCritical) {
      this.scheduleEscalation(alert)
    }
  }

  private sendBrowserNotification(alert: any): void {
    if ("Notification" in window && Notification.permission === "granted") {
      const urgency = alert.type === "overdue" ? "🚨 OVERDUE" : "⚠️ WARNING"
      const title = `${urgency}: ${alert.vehicleInfo}`
      const body = `${alert.step} is ${alert.currentDays}/${alert.targetDays} days. ${alert.message}`

      new Notification(title, {
        body,
        icon: "/favicon.ico",
        requireInteraction: alert.type === "overdue",
        tag: `timeline-${alert.vin}-${alert.step}`,
      })

      // Play sound if enabled
      if (this.preferences.browser.enabled) {
        playSound(alert.type)
      }
    }
  }

  private async sendEmailJSNotification(alert: any): Promise<void> {
    try {
      // Load EmailJS dynamically
      const emailjs = await import("emailjs-com")

      const templateParams = {
        to_emails: this.preferences.email.recipientEmail,
        subject: this.generateEmailSubject(alert),
        vehicle_info: alert.vehicleInfo,
        vin: alert.vin,
        step: alert.step.charAt(0).toUpperCase() + alert.step.slice(1),
        current_days: alert.currentDays,
        target_days: alert.targetDays,
        message: alert.message,
        urgency: alert.type === "overdue" ? "OVERDUE" : "WARNING",
        urgency_color: alert.type === "overdue" ? "#dc2626" : "#d97706",
        timestamp: new Date().toLocaleString(),
      }

      await emailjs.send(
        this.preferences.email.serviceId,
        this.preferences.email.templateId,
        templateParams,
        this.preferences.email.publicKey,
      )

      console.log("EmailJS notification sent successfully")
    } catch (error) {
      console.error("Failed to send EmailJS notification:", error)
      this.sendBrowserNotification({
        ...alert,
        message: "Email notification failed - check EmailJS settings",
      })
    }
  }

  private async sendWebhookNotification(alert: any): Promise<void> {
    const promises = this.preferences.webhook.url.map((url) => this.sendSingleWebhook(url, alert))

    try {
      await Promise.allSettled(promises)
    } catch (error) {
      console.error("Webhook notifications failed:", error)
    }
  }

  private async sendSingleWebhook(url: string, alert: any): Promise<void> {
    try {
      let payload: any

      if (url.includes("discord")) {
        payload = this.createDiscordPayload(alert)
      } else if (url.includes("slack")) {
        payload = this.createSlackPayload(alert)
      } else {
        payload = this.createGenericPayload(alert)
      }

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error(`Webhook failed: ${response.statusText}`)
      }

      console.log("Webhook notification sent successfully")
    } catch (error) {
      console.error("Failed to send webhook notification:", error)
    }
  }

  private createDiscordPayload(alert: any): any {
    const urgencyColor = alert.type === "overdue" ? 0xdc2626 : 0xd97706
    const urgencyEmoji = alert.type === "overdue" ? "🚨" : "⚠️"

    return {
      embeds: [
        {
          title: `${urgencyEmoji} Timeline Alert - ${alert.type.toUpperCase()}`,
          description: alert.message,
          color: urgencyColor,
          fields: [
            {
              name: "Vehicle",
              value: alert.vehicleInfo,
              inline: true,
            },
            {
              name: "VIN",
              value: `\`${alert.vin}\``,
              inline: true,
            },
            {
              name: "Step",
              value: alert.step.charAt(0).toUpperCase() + alert.step.slice(1),
              inline: true,
            },
            {
              name: "Timeline",
              value: `${alert.currentDays}/${alert.targetDays} days`,
              inline: true,
            },
            {
              name: "Status",
              value: alert.type === "overdue" ? "🔴 Overdue" : "🟡 At Risk",
              inline: true,
            },
          ],
          timestamp: new Date().toISOString(),
          footer: {
            text: "Recon Tracker Alert System",
          },
        },
      ],
    }
  }

  private createSlackPayload(alert: any): any {
    const urgencyColor = alert.type === "overdue" ? "danger" : "warning"
    const urgencyEmoji = alert.type === "overdue" ? ":rotating_light:" : ":warning:"

    return {
      attachments: [
        {
          color: urgencyColor,
          title: `${urgencyEmoji} Timeline Alert - ${alert.type.toUpperCase()}`,
          text: alert.message,
          fields: [
            {
              title: "Vehicle",
              value: alert.vehicleInfo,
              short: true,
            },
            {
              title: "VIN",
              value: alert.vin,
              short: true,
            },
            {
              title: "Step",
              value: alert.step.charAt(0).toUpperCase() + alert.step.slice(1),
              short: true,
            },
            {
              title: "Timeline",
              value: `${alert.currentDays}/${alert.targetDays} days`,
              short: true,
            },
          ],
          footer: "Recon Tracker",
          ts: Math.floor(Date.now() / 1000),
        },
      ],
    }
  }

  private createGenericPayload(alert: any): any {
    return {
      title: `Timeline Alert - ${alert.type.toUpperCase()}`,
      message: alert.message,
      vehicle: alert.vehicleInfo,
      vin: alert.vin,
      step: alert.step,
      currentDays: alert.currentDays,
      targetDays: alert.targetDays,
      urgency: alert.type,
      timestamp: new Date().toISOString(),
    }
  }

  private generateEmailSubject(alert: any): string {
    const urgency = alert.type === "overdue" ? "🚨 OVERDUE" : "⚠️ WARNING"
    return `${urgency}: ${alert.vehicleInfo} - ${alert.step} Timeline Alert`
  }

  private scheduleEscalation(alert: any): void {
    const escalationKey = `escalation-${alert.vin}-${alert.step}`

    // Clear any existing escalation
    const existingTimeout = localStorage.getItem(escalationKey)
    if (existingTimeout) {
      clearTimeout(Number(existingTimeout))
    }

    // Schedule new escalation
    const timeoutId = setTimeout(
      async () => {
        await this.sendEscalationNotification(alert)
        localStorage.removeItem(escalationKey)
      },
      this.preferences.escalation.delayHours * 60 * 60 * 1000,
    )

    localStorage.setItem(escalationKey, timeoutId.toString())
  }

  private async sendEscalationNotification(alert: any): Promise<void> {
    const escalationAlert = {
      ...alert,
      message: `ESCALATION: ${alert.message} - No action taken after ${this.preferences.escalation.delayHours} hours.`,
      type: "overdue" as const,
    }

    // Send browser notification
    this.sendBrowserNotification({
      ...escalationAlert,
      vehicleInfo: `🚨 ESCALATION: ${escalationAlert.vehicleInfo}`,
    })

    // Send to manager emails via EmailJS
    if (this.preferences.escalation.managerEmails.length > 0 && this.preferences.email.serviceId) {
      try {
        const emailjs = await import("emailjs-com")

        const templateParams = {
          to_emails: this.preferences.escalation.managerEmails.join(","),
          subject: `🚨 ESCALATION: ${alert.vehicleInfo} - ${alert.step} Timeline Alert`,
          vehicle_info: alert.vehicleInfo,
          vin: alert.vin,
          step: alert.step.charAt(0).toUpperCase() + alert.step.slice(1),
          current_days: alert.currentDays,
          target_days: alert.targetDays,
          message: escalationAlert.message,
          urgency: "ESCALATION",
          urgency_color: "#dc2626",
          timestamp: new Date().toLocaleString(),
          escalation_hours: this.preferences.escalation.delayHours,
        }

        await emailjs.send(
          this.preferences.email.serviceId,
          this.preferences.email.templateId,
          templateParams,
          this.preferences.email.publicKey,
        )
      } catch (error) {
        console.error("Failed to send escalation email:", error)
      }
    }

    // Send to manager webhooks
    if (this.preferences.escalation.managerWebhooks.length > 0) {
      const promises = this.preferences.escalation.managerWebhooks.map((url) =>
        this.sendSingleWebhook(url, {
          ...escalationAlert,
          vehicleInfo: `🚨 ESCALATION: ${escalationAlert.vehicleInfo}`,
        }),
      )
      await Promise.allSettled(promises)
    }
  }

  // Test notification methods
  async testBrowserNotification(): Promise<boolean> {
    try {
      if ("Notification" in window) {
        if (Notification.permission !== "granted") {
          const permission = await Notification.requestPermission()
          if (permission !== "granted") {
            return false
          }
        }

        const notification = new Notification("Recon Tracker - Test Notification", {
          body: "Browser notifications are working correctly! 🎉",
          icon: "/favicon.ico",
          requireInteraction: false,
        })

        if (this.preferences.browser.enabled) {
          playSound("warning")
        }

        setTimeout(() => notification.close(), 5000)
        return true
      }
      return false
    } catch (error) {
      console.error("Test browser notification failed:", error)
      return false
    }
  }

  async testEmailNotification(): Promise<boolean> {
    if (!this.preferences.email.serviceId || !this.preferences.email.templateId || !this.preferences.email.publicKey) {
      return false
    }

    try {
      const emailjs = await import("emailjs-com")

      const templateParams = {
        to_emails: this.preferences.email.recipientEmail,
        subject: "Recon Tracker - Test Email Notification",
        vehicle_info: "Test Vehicle (2023 Honda Civic)",
        vin: "TEST123456789",
        step: "Test Step",
        current_days: 1,
        target_days: 2,
        message: "This is a test notification to verify your email settings are working correctly.",
        urgency: "TEST",
        urgency_color: "#3b82f6",
        timestamp: new Date().toLocaleString(),
      }

      await emailjs.send(
        this.preferences.email.serviceId,
        this.preferences.email.templateId,
        templateParams,
        this.preferences.email.publicKey,
      )

      return true
    } catch (error) {
      console.error("Test email failed:", error)
      return false
    }
  }

  async testWebhookNotification(): Promise<boolean> {
    if (this.preferences.webhook.url.length === 0) {
      return false
    }

    try {
      const testAlert = {
        vehicleInfo: "Test Vehicle (2023 Honda Civic)",
        vin: "TEST123456789",
        step: "test",
        type: "warning" as const,
        currentDays: 1,
        targetDays: 2,
        message: "This is a test notification to verify your webhook settings are working correctly.",
      }

      await this.sendWebhookNotification(testAlert)
      return true
    } catch (error) {
      console.error("Test webhook failed:", error)
      return false
    }
  }
}

export const notificationService = NotificationService.getInstance()

// Function to play sound
const playSound = (level: NotificationLevel) => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    gainNode.gain.value = 0.2 // Volume (0 to 1)

    if (level === "warning") {
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime) // 600 Hz for warning
      oscillator.start()
      oscillator.stop(audioContext.currentTime + 0.2) // Play for 0.2 seconds
    } else if (level === "critical") {
      // Rapid beeping for critical
      const startTime = audioContext.currentTime
      for (let i = 0; i < 3; i++) {
        oscillator.frequency.setValueAtTime(800, startTime + i * 0.15)
        oscillator.frequency.setValueAtTime(600, startTime + i * 0.15 + 0.075)
        oscillator.start(startTime + i * 0.15)
        oscillator.stop(startTime + i * 0.15 + 0.1)
      }
    }
  } catch (e) {
    console.warn("Web Audio API not supported or failed to play sound:", e)
  }
}

// Function to send browser notification
const sendBrowserNotification = (title: string, body: string, level: NotificationLevel) => {
  if (!("Notification" in window)) {
    console.warn("Browser notifications not supported.")
    return
  }

  if (Notification.permission === "granted") {
    new Notification(title, { body })
    playSound(level)
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        new Notification(title, { body })
        playSound(level)
      }
    })
  }
}

// Function to send webhook notification
const sendWebhookNotification = async (url: string, payload: any) => {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
    if (!response.ok) {
      console.error(`Webhook failed: ${response.status} ${response.statusText}`)
      return { success: false, message: `Webhook failed: ${response.statusText}` }
    }
    console.log("Webhook sent successfully.")
    return { success: true, message: "Webhook sent successfully." }
  } catch (error) {
    console.error("Error sending webhook:", error)
    return { success: false, message: `Error sending webhook: ${error}` }
  }
}

// Main notification service function
export const notify = async (
  type: NotificationType,
  level: NotificationLevel,
  title: string,
  message: string,
  details?: Record<string, any>,
) => {
  const { preferences } = useNotificationStore.getState()

  // 1. Browser Notification
  if (preferences.browser.enabled) {
    sendBrowserNotification(title, message, level)
  }

  // 2. Email Notification
  if (preferences.email.enabled && preferences.email.recipientEmail) {
    const emailSubject = `Recon Tracker Alert: ${title}`
    const emailBody = `
      <html>
      <body style="font-family: sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9;">
          <h2 style="color: ${level === "critical" ? "#dc2626" : "#f59e0b"};">${title}</h2>
          <p>${message}</p>
          ${
            details
              ? `<div style="margin-top: 20px; padding: 15px; background-color: #eee; border-radius: 5px;">
                 <h3 style="margin-top: 0; color: #555;">Details:</h3>
                 <ul style="list-style: none; padding: 0;">
                   ${Object.entries(details)
                     .map(([key, value]) => `<li><strong>${key}:</strong> ${value}</li>`)
                     .join("")}
                 </ul>
               </div>`
              : ""
          }
          <p style="margin-top: 30px; font-size: 0.9em; color: #777;">
            This is an automated notification from Recon Tracker.
          </p>
        </div>
      </body>
      </html>
    `
    await sendEmailNotification(
      preferences.email.recipientEmail,
      preferences.email.recipientName || "Recipient",
      emailSubject,
      message,
      emailBody,
    )
  }

  // 3. Webhook Notification
  if (preferences.webhook.enabled && preferences.webhook.url) {
    const payload = {
      content: `**Recon Tracker Alert: ${title}**\n${message}`,
      embeds: [
        {
          title: title,
          description: message,
          color: level === "critical" ? 16711680 : 16776960, // Red for critical, Yellow for warning
          fields: details
            ? Object.entries(details).map(([name, value]) => ({ name, value: String(value), inline: true }))
            : [],
          timestamp: new Date().toISOString(),
          footer: {
            text: "Recon Tracker Notification",
          },
        },
      ],
    }
    await sendWebhookNotification(preferences.webhook.url, payload)
  }

  // Display a toast for immediate user feedback
  toast[level === "critical" ? "error" : "warning"](title, {
    description: message,
    duration: level === "critical" ? 8000 : 5000,
  })
}
