import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest, { params }: { params: { vin: string } }) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const vehicle = await prisma.vehicle.findUnique({
      where: { vin: params.vin },
      include: {
        assignments: {
          include: {
            team: true,
            user: true,
          },
        },
      },
    })

    if (!vehicle) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 })
    }

    // Check if user has access to this vehicle
    if (session.user.role !== "admin" && session.user.role !== "manager") {
      const hasAccess = vehicle.assignments.some((assignment) => assignment.teamId === session.user.teamId)

      if (!hasAccess) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 })
      }
    }

    return NextResponse.json(vehicle)
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { vin: string } }) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { throughShop, detailComplete, photoComplete, shopDone, detailDone, photoDone } = body

    // Check permissions based on user role and department
    const canEditShop =
      session.user.department === "shop" || session.user.role === "admin" || session.user.role === "manager"
    const canEditDetail =
      session.user.department === "detail" || session.user.role === "admin" || session.user.role === "manager"
    const canEditPhoto =
      session.user.department === "photo" || session.user.role === "admin" || session.user.role === "manager"

    const updateData: any = {}

    if (throughShop !== undefined && canEditShop) {
      updateData.throughShop = throughShop
      if (throughShop && !shopDone) {
        updateData.shopDone = new Date().toISOString()
      }
    }

    if (detailComplete !== undefined && canEditDetail) {
      updateData.detailComplete = detailComplete
      if (detailComplete && !detailDone) {
        updateData.detailDone = new Date().toISOString()
      }
    }

    if (photoComplete !== undefined && canEditPhoto) {
      updateData.photoComplete = photoComplete
      if (photoComplete && !photoDone) {
        updateData.photoDone = new Date().toISOString()
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No valid updates provided" }, { status: 400 })
    }

    const vehicle = await prisma.vehicle.update({
      where: { vin: params.vin },
      data: updateData,
      include: {
        assignments: {
          include: {
            team: true,
            user: true,
          },
        },
      },
    })

    return NextResponse.json(vehicle)
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
