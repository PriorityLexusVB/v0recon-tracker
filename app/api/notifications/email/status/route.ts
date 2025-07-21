import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const { notificationId, status } = await request.json()

    if (!notificationId || !status) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: notificationId, status" },
        { status: 400 },
      )
    }

    const updatedNotification = await prisma.notification.update({
      where: { id: notificationId },
      data: { status },
    })

    return NextResponse.json({ success: true, notification: updatedNotification })
  } catch (error) {
    console.error("Notification Status API error:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error occurred" },
      { status: 500 },
    )
  }
}
