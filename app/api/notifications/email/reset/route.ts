import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email, resetToken } = await request.json()

    const notification = {
      to: email,
      subject: "Password Reset Request",
      message: `Click the link to reset your password: ${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`,
      type: "password_reset",
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
    console.error("Reset email API error:", error)
    return NextResponse.json({ success: false, error: "Failed to send reset email" }, { status: 500 })
  }
}
