import { type NextRequest, NextResponse } from "next/server"
import { sendEmail } from "@/lib/email-service"

export async function POST(request: NextRequest) {
  try {
    const notification = await request.json()

    if (!notification.to || !notification.subject || !notification.html) {
      return NextResponse.json({ success: false, error: "Missing required fields: to, subject, html" }, { status: 400 })
    }

    const result = await sendEmail(notification)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Email API error:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error occurred" },
      { status: 500 },
    )
  }
}
