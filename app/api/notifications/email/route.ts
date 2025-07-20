import { type NextRequest, NextResponse } from "next/server"

// Mock email service for when EmailJS is not configured
async function sendEmailMock(notification: any) {
  console.log("Mock Email Service - Would send:", notification)
  return { success: true, message: "Email sent (mock)" }
}

export async function POST(request: NextRequest) {
  try {
    const notification = await request.json()

    // For now, always use mock service since EmailJS Node.js package isn't installed
    const result = await sendEmailMock(notification)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Email API error:", error)

    // Fallback to mock service on error
    const notification = await request.json()
    const result = await sendEmailMock(notification)
    return NextResponse.json(result)
  }
}
