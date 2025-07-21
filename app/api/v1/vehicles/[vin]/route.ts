import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest, { params }: { params: { vin: string } }) {
  const session = await auth()
  if (!session || !session.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const { vin } = params

  try {
    const vehicle = await prisma.vehicle.findUnique({
      where: { vin },
      include: {
        assignments: {
          include: {
            team: true,
            user: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    })

    if (!vehicle) {
      return NextResponse.json({ message: "Vehicle not found" }, { status: 404 })
    }

    return NextResponse.json(vehicle)
  } catch (error) {
    console.error(`Error fetching vehicle ${vin}:`, error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { vin: string } }) {
  const session = await auth()
  if (!session || !session.user || (session.user.role !== "ADMIN" && session.user.role !== "MANAGER")) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const { vin } = params
  const body = await request.json()

  try {
    const updatedVehicle = await prisma.vehicle.update({
      where: { vin },
      data: {
        make: body.make,
        model: body.model,
        year: body.year,
        color: body.color,
        mileage: body.mileage,
        price: body.price,
        status: body.status,
        priority: body.priority,
        location: body.location,
        notes: body.notes,
        // Add other fields as needed
      },
    })
    return NextResponse.json(updatedVehicle)
  } catch (error) {
    console.error(`Error updating vehicle ${vin}:`, error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { vin: string } }) {
  const session = await auth()
  if (!session || !session.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const { vin } = params

  try {
    await prisma.vehicle.delete({
      where: { vin },
    })
    return NextResponse.json({ message: "Vehicle deleted successfully" })
  } catch (error) {
    console.error(`Error deleting vehicle ${vin}:`, error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
