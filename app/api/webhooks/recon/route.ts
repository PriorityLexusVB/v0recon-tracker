import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const event = await request.json()
    console.log("Received webhook event:", event)

    // Example: Handle a vehicle status update from an external system
    if (event.type === "vehicle.status_updated" && event.data?.vin && event.data?.newStatus) {
      const { vin, newStatus } = event.data

      const updatedVehicle = await prisma.vehicle.update({
        where: { vin },
        data: { status: newStatus },
      })

      console.log(`Vehicle ${vin} status updated to ${newStatus}`)
      return NextResponse.json({ success: true, message: "Vehicle status updated", vehicle: updatedVehicle })
    }

    // Example: Handle a new vehicle added
    if (event.type === "vehicle.added" && event.data?.vin) {
      const { vin, make, model, year, stock } = event.data
      const newVehicle = await prisma.vehicle.create({
        data: {
          vin,
          make,
          model,
          year,
          stock,
          status: "PENDING",
          priority: "NORMAL",
          inventoryDate: new Date(),
          daysInInventory: 0,
        },
      })
      console.log(`New vehicle ${vin} added`)
      return NextResponse.json({ success: true, message: "New vehicle added", vehicle: newVehicle })
    }

    return NextResponse.json({ success: false, message: "Event type not supported" }, { status: 400 })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error occurred" },
      { status: 500 },
    )
  }
}
