import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { addTimelineEvent, updateVehicleStatus } from "@/app/actions/vehicles"

// This webhook is designed to receive updates from an external system,
// such as a vAuto integration or another recon management tool.
// For security, it's highly recommended to implement webhook signature verification.

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()

    // --- Webhook Signature Verification (Highly Recommended) ---
    // const signature = request.headers.get('X-Webhook-Signature');
    // if (!verifySignature(payload, signature, process.env.WEBHOOK_SECRET)) {
    //   return NextResponse.json({ success: false, error: "Invalid signature" }, { status: 401 });
    // }
    // ----------------------------------------------------------

    const { vin, status, currentLocation, eventType, description, assignedToEmail } = payload

    if (!vin) {
      return NextResponse.json({ success: false, error: "VIN is required in webhook payload" }, { status: 400 })
    }

    const vehicle = await prisma.vehicle.findUnique({
      where: { vin: vin.toUpperCase() },
    })

    if (!vehicle) {
      return NextResponse.json({ success: false, error: `Vehicle with VIN ${vin} not found` }, { status: 404 })
    }

    let userId: string | undefined = undefined
    if (assignedToEmail) {
      const user = await prisma.user.findUnique({
        where: { email: assignedToEmail },
        select: { id: true },
      })
      userId = user?.id
    }

    // Handle status update if provided
    if (status && status !== vehicle.status) {
      await updateVehicleStatus(vehicle.id, status) // This action already adds timeline event and notifications
    }

    // Add a generic timeline event if eventType and description are provided
    if (eventType && description) {
      await addTimelineEvent({
        vehicleId: vehicle.id,
        eventType: eventType,
        description: description,
        department: currentLocation || vehicle.currentLocation || undefined,
        userId: userId || vehicle.assignedToId || undefined,
      })
    }

    // You can add more complex logic here based on the webhook payload
    // e.g., update reconditioning cost, mileage, etc.

    return NextResponse.json({ success: true, message: "Webhook processed successfully." })
  } catch (error) {
    console.error("Recon Webhook error:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error occurred" },
      { status: 500 },
    )
  }
}

// Helper function for signature verification (example, implement securely)
// function verifySignature(payload: any, signature: string | null, secret: string | undefined): boolean {
//   if (!signature || !secret) return false;
//   // Implement your specific signature verification logic here
//   // e.g., using crypto.createHmac and comparing hashes
//   return true;
// }
