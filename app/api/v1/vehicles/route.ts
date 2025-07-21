import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session || !session.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const status = searchParams.get("status")
  const make = searchParams.get("make")
  const searchTerm = searchParams.get("search")
  const priority = searchParams.get("priority")
  const page = Number.parseInt(searchParams.get("page") || "1")
  const limit = Number.parseInt(searchParams.get("limit") || "10")
  const skip = (page - 1) * limit

  const where: any = {}

  if (status && status !== "all") {
    where.status = status.toUpperCase()
  }
  if (make && make !== "all") {
    where.make = make
  }
  if (priority && priority !== "all") {
    where.priority = priority.toUpperCase()
  }
  if (searchTerm) {
    where.OR = [
      { vin: { contains: searchTerm, mode: "insensitive" } },
      { stock: { contains: searchTerm, mode: "insensitive" } },
      { make: { contains: searchTerm, mode: "insensitive" } },
      { model: { contains: searchTerm, mode: "insensitive" } },
    ]
  }

  try {
    const [vehicles, totalCount] = await prisma.$transaction([
      prisma.vehicle.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          inventoryDate: "asc",
        },
      }),
      prisma.vehicle.count({ where }),
    ])

    return NextResponse.json({
      data: vehicles,
      total: totalCount,
      page,
      limit,
    })
  } catch (error) {
    console.error("Error fetching vehicles:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session || !session.user || (session.user.role !== "ADMIN" && session.user.role !== "MANAGER")) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()

  try {
    const newVehicle = await prisma.vehicle.create({
      data: {
        vin: body.vin,
        stock: body.stock,
        make: body.make,
        model: body.model,
        year: body.year,
        color: body.color,
        mileage: body.mileage,
        price: body.price,
        inventoryDate: body.inventoryDate ? new Date(body.inventoryDate) : new Date(),
        daysInInventory: body.daysInInventory || 0,
        status: body.status || "PENDING",
        priority: body.priority || "NORMAL",
        location: body.location || "Lot",
        notes: body.notes || "",
      },
    })
    return NextResponse.json(newVehicle, { status: 201 })
  } catch (error) {
    console.error("Error creating vehicle:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
