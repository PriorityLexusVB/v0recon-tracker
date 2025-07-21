import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest, { params }: { params: { vin: string } }) {
  const { vin } = params

  if (!vin) {
    return NextResponse.json({ error: "VIN is required" }, { status: 400 })
  }

  try {
    const vehicle = await prisma.vehicle.findUnique({
      where: { vin: vin.toUpperCase() },
      include: {
        assignedTo: {
          select: { id: true, name: true, email: true },
        },
        timelineEvents: {
          orderBy: { timestamp: "desc" },
          include: { user: { select: { id: true, name: true } } },
        },
      },
    })

    if (!vehicle) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 })
    }

    return NextResponse.json(vehicle)
  } catch (error) {
    console.error("API Error fetching vehicle by VIN:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { vin: string } }) {
  const { vin } = params
  const data = await request.json()

  if (!vin) {
    return NextResponse.json({ error: "VIN is required" }, { status: 400 })
  }

  try {
    const updatedVehicle = await prisma.vehicle.update({
      where: { vin: vin.toUpperCase() },
      data: {
        stockNumber: data.stockNumber,
        year: data.year,
        make: data.make,
        model: data.model,
        trim: data.trim,
        color: data.color,
        mileage: data.mileage,
        status: data.status,
        currentLocation: data.currentLocation,
        assignedToId: data.assignedToId,
        reconditioningCost: data.reconditioningCost,
        daysInRecon: data.daysInRecon,
      },
    })

    return NextResponse.json(updatedVehicle)
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 })
    }
    console.error("API Error updating vehicle by VIN:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { vin: string } }) {
  const { vin } = params

  if (!vin) {
    return NextResponse.json({ error: "VIN is required" }, { status: 400 })
  }

  try {
    await prisma.vehicle.delete({
      where: { vin: vin.toUpperCase() },
    })
    return NextResponse.json({ message: "Vehicle deleted successfully" })
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 })
    }
    console.error("API Error deleting vehicle by VIN:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
