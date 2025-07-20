import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const status = searchParams.get("status")
    const team = searchParams.get("team")

    const skip = (page - 1) * limit

    // Build where clause based on filters
    const where: any = {}

    if (status && status !== "all") {
      switch (status) {
        case "completed":
          where.AND = [{ throughShop: true }, { detailComplete: true }, { photoComplete: true }]
          break
        case "pending":
          where.OR = [{ throughShop: false }, { detailComplete: false }, { photoComplete: false }]
          break
      }
    }

    if (team) {
      where.assignedTeam = team
    }

    // If user is not admin/manager, filter by their team/department
    if (session.user.role !== "admin" && session.user.role !== "manager") {
      if (session.user.teamId) {
        where.assignedTeam = session.user.teamId
      }
    }

    const [vehicles, total] = await Promise.all([
      prisma.vehicle.findMany({
        where,
        skip,
        take: limit,
        orderBy: { inventoryDate: "desc" },
        include: {
          assignments: {
            include: {
              team: true,
              user: true,
            },
          },
        },
      }),
      prisma.vehicle.count({ where }),
    ])

    return NextResponse.json({
      vehicles,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || (session.user.role !== "admin" && session.user.role !== "manager")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { vin, stock, make, model, year, inventoryDate } = body

    const vehicle = await prisma.vehicle.create({
      data: {
        vin,
        stock,
        make,
        model,
        year: Number.parseInt(year),
        inventoryDate: new Date(inventoryDate),
        throughShop: false,
        detailComplete: false,
        photoComplete: false,
      },
    })

    return NextResponse.json(vehicle, { status: 201 })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
