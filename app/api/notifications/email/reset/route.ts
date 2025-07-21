import { type NextRequest, NextResponse } from "next/server"
import { sendEmail } from "@/lib/email-service"

export async function POST(request: NextRequest) {
  try {
    const { to, token } = await request.json()

    if (!to || !token) {
      return NextResponse.json({ success: false, error: "Missing required fields: to, token" }, { status: 400 })
    }

    const subject = "Recon Tracker Password Reset"
    const resetLink = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`
    const html = `
      <p>You have requested a password reset for your Recon Tracker account.</p>
      <p>Please click the link below to reset your password:</p>
      <p><a href="${resetLink}">Reset Password</a></p>
      <p>If you did not request this, please ignore this email.</p>
    `

    const result = await sendEmail({ to, subject, html })

    if (result.success) {
      return NextResponse.json({ success: true, message: "Password reset email sent." })
    } else {
      return NextResponse.json(
        { success: false, error: result.message || "Failed to send reset email." },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Password Reset Email API error:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error occurred" },
      { status: 500 },
    )
  }
}
