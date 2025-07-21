import { type NextRequest, NextResponse } from "next/server"
import { sendBulkNotifications } from "@/lib/email-service"

export async function POST(request: NextRequest) {
  try {
    const { notifications } = await request.json() // Expecting an array of { to, subject, message, type }

    if (!notifications || !Array.isArray(notifications) || notifications.length === 0) {
      return NextResponse.json(
        { success: false, error: "Missing or invalid 'notifications' array in request body" },
        { status: 400 },
      )
    }

    const result = await sendBulkNotifications(notifications)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Bulk Email API error:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error occurred" },
      { status: 500 },
    )
  }
}
