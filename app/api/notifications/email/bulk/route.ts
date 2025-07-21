import { type NextRequest, NextResponse } from "next/server"
import { sendEmail } from "@/lib/email-service"

export async function POST(request: NextRequest) {
  try {
    const { recipients, subject, body } = await request.json()

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0 || !subject || !body) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: recipients, subject, body" },
        { status: 400 },
      )
    }

    const results = []
    for (const recipient of recipients) {
      const result = await sendEmail({ to: recipient, subject, html: body })
      results.push({ recipient, success: result.success, message: result.message })
    }

    return NextResponse.json({ success: true, results })
  } catch (error) {
    console.error("Bulk Email API error:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error occurred" },
      { status: 500 },
    )
  }
}
