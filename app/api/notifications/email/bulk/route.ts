import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { notifications } = await request.json()

    // Send all notifications using the main email route
    const results = await Promise.allSettled(
      notifications.map(async (notification: any) => {
        const response = await fetch(`${request.nextUrl.origin}/api/notifications/email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(notification),
        })
        return response.json()
      }),
    )

    const successful = results.filter((result) => result.status === "fulfilled").length
    const failed = results.filter((result) => result.status === "rejected").length

    return NextResponse.json({
      success: true,
      results: {
        total: notifications.length,
        successful,
        failed,
      },
    })
  } catch (error) {
    console.error("Bulk email API error:", error)
    return NextResponse.json({ success: false, error: "Failed to send bulk emails" }, { status: 500 })
  }
}
