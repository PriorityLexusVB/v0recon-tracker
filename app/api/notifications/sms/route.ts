import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { to, message } = await request.json()

    if (!to || !message) {
      return NextResponse.json({ success: false, error: "Missing required fields: to, message" }, { status: 400 })
    }

    // This is a placeholder for a real SMS service (e.g., Twilio, Vonage)
    console.log(`[SMS Service] Sending SMS to ${to}: "${message}"`)

    // In a real application, you would integrate with an SMS API here
    // const smsResult = await twilioClient.messages.create({
    //   body: message,
    //   from: process.env.TWILIO_PHONE_NUMBER,
    //   to: to,
    // });

    return NextResponse.json({ success: true, message: "SMS sent (mock service)." })
  } catch (error) {
    console.error("SMS API error:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error occurred" },
      { status: 500 },
    )
  }
}
