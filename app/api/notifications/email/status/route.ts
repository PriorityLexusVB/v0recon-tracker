import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email, status, vehicleInfo } = await request.json()

    const notification = {
      to: email,
      subject: `Vehicle Status Update - ${vehicleInfo?.vin || "Unknown"}`,
      message: `Vehicle status has been updated to: ${status}. Vehicle: ${vehicleInfo?.year || ""} ${vehicleInfo?.make || ""} ${vehicleInfo?.model || ""} (VIN: ${vehicleInfo?.vin || "Unknown"})`,
      type: "notification",
    }

    // Use the main email route
    const response = await fetch(`${request.nextUrl.origin}/api/notifications/email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(notification),
    })

    const result = await response.json()
    return NextResponse.json(result)
  } catch (error) {
    console.error("Status email API error:", error)
    return NextResponse.json({ success: false, error: "Failed to send status email" }, { status: 500 })
  }
}
