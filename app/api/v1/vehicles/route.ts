import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get("status")
  const assignedToId = searchParams.get("assignedToId")
  const query = searchParams.get("query")
  const page = Number.parseInt(searchParams.get("page") || "1")
  const limit = Number.parseInt(searchParams.get("limit") || "10")

  const offset = (page - 1) * limit

  const whereClause: any = {}
  if (status && status !== "ALL") {
    whereClause.status = status
  }
  if (assignedToId && assignedToId !== "ALL") {
    whereClause.assignedToId = assignedToId
  }
  if (query) {
    whereClause.OR = [
      { vin: { contains: query, mode: "insensitive" } },
      { make: { contains: query, mode: "insensitive" } },
      { model: { contains: query, mode: "insensitive" } },
      { stockNumber: { contains: query, mode: "insensitive" } },
    ]
  }

  try {
    const vehicles = await prisma.vehicle.findMany({
      where: whereClause,
      include: {
        assignedTo: {
          select: { id: true, name: true, email: true },
        },
        timelineEvents: {
          orderBy: { timestamp: "desc" },
          take: 1, // Get the latest event for quick overview
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: offset,
      take: limit,
    })

    const totalVehicles = await prisma.vehicle.count({ where: whereClause })

    return NextResponse.json({
      vehicles,
      totalPages: Math.ceil(totalVehicles / limit),
      currentPage: page,
      totalCount: totalVehicles,
    })
  } catch (error) {
    console.error("API Error fetching vehicles:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const data = await request.json()

  // Basic validation (more robust validation should be done with Zod or similar)
  if (!data.vin || !data.year || !data.make || !data.model) {
    return NextResponse.json({ error: "Missing required fields: vin, year, make, model" }, { status: 400 })
  }

  try {
    const newVehicle = await prisma.vehicle.create({
      data: {
        vin: data.vin.toUpperCase(),
        stockNumber: data.stockNumber,
        year: data.year,
        make: data.make,
        model: data.model,
        trim: data.trim,
        color: data.color,
        mileage: data.mileage,
        status: data.status || "IN_PROGRESS",
        currentLocation: data.currentLocation,
        assignedToId: data.assignedToId,
        reconditioningCost: data.reconditioningCost,
        daysInRecon: 0, // New vehicles start with 0 days in recon
      },
    })

    // Optionally add a timeline event for check-in
    await prisma.timelineEvent.create({
      data: {
        vehicleId: newVehicle.id,
        eventType: "CHECK_IN",
        description: `Vehicle checked in. Initial status: ${newVehicle.status}.`,
        department: newVehicle.currentLocation,
        userId: newVehicle.assignedToId,
      },
    })

    return NextResponse.json(newVehicle, { status: 201 })
  } catch (error: any) {
    if (error.code === "P2002" && error.meta?.target?.includes("vin")) {
      return NextResponse.json({ error: "A vehicle with this VIN already exists." }, { status: 409 })
    }
    console.error("API Error creating vehicle:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
