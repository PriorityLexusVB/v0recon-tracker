import { type NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const headersList = headers()
    const signature = headersList.get("x-recon-signature")
    const timestamp = headersList.get("x-recon-timestamp")

    // Verify webhook signature if secret is configured
    const webhookSecret = process.env.WEBHOOK_SECRET
    if (webhookSecret && signature) {
      const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(timestamp + "." + body)
        .digest("hex")

      if (signature !== `sha256=${expectedSignature}`) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
      }
    }

    const payload = JSON.parse(body)
    const { event, data } = payload

    // Process different webhook events
    switch (event) {
      case "vehicle.completed":
        console.log("Vehicle completed:", data.vin)
        // Add your custom logic here
        break

      case "vehicle.overdue":
        console.log("Vehicle overdue:", data.vin)
        // Add your custom logic here
        break

      case "team.assigned":
        console.log("Team assigned:", data.teamId, "to vehicle:", data.vin)
        // Add your custom logic here
        break

      case "daily.report":
        console.log("Daily report generated:", data.date)
        // Add your custom logic here
        break

      default:
        console.log("Unknown webhook event:", event)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook Error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
