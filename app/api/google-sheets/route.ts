import { type NextRequest, NextResponse } from "next/server"
import { google } from "googleapis"
import { prisma } from "@/lib/prisma"
import { addTimelineEvent } from "@/app/actions/vehicles"

// This route handler is for syncing data from Google Sheets
// It expects a POST request with a body containing the sheet data
// For security, you might want to add authentication/authorization to this endpoint
// e.g., check for a secret token in the request headers

export async function POST(request: NextRequest) {
  try {
    const { sheetData } = await request.json()

    if (!sheetData || !Array.isArray(sheetData) || sheetData.length === 0) {
      return NextResponse.json(
        { success: false, error: "Missing or invalid sheetData in request body" },
        { status: 400 },
      )
    }

    const processedVehicles = []

    for (const row of sheetData) {
      const {
        VIN,
        Stock,
        Year,
        Make,
        Model,
        Trim,
        Color,
        Mileage,
        Status,
        Current_Location,
        Assigned_To_Email,
        Reconditioning_Cost,
        Days_In_Recon,
        Last_Updated,
      } = row

      if (!VIN || !Year || !Make || !Model) {
        console.warn("Skipping row due to missing essential data:", row)
        continue
      }

      let assignedToId: string | null = null
      if (Assigned_To_Email) {
        const user = await prisma.user.findUnique({
          where: { email: Assigned_To_Email },
          select: { id: true },
        })
        assignedToId = user?.id || null
      }

      const existingVehicle = await prisma.vehicle.findUnique({
        where: { vin: VIN },
      })

      const reconditioningCost = Number.parseFloat(Reconditioning_Cost) || 0
      const daysInRecon = Number.parseInt(Days_In_Recon) || 0
      const mileage = Number.parseInt(Mileage) || 0
      const year = Number.parseInt(Year)

      if (existingVehicle) {
        // Update existing vehicle
        const updatedVehicle = await prisma.vehicle.update({
          where: { id: existingVehicle.id },
          data: {
            stockNumber: Stock || existingVehicle.stockNumber,
            year: year,
            make: Make || existingVehicle.make,
            model: Model || existingVehicle.model,
            trim: Trim || existingVehicle.trim,
            color: Color || existingVehicle.color,
            mileage: mileage,
            status: Status || existingVehicle.status,
            currentLocation: Current_Location || existingVehicle.currentLocation,
            assignedToId: assignedToId,
            reconditioningCost: reconditioningCost,
            daysInRecon: daysInRecon,
            lastUpdated: Last_Updated ? new Date(Last_Updated) : new Date(),
          },
        })

        // Add timeline event if status or location changed
        if (Status && Status !== existingVehicle.status) {
          await addTimelineEvent({
            vehicleId: updatedVehicle.id,
            eventType: "STATUS_CHANGE",
            description: `Status changed from ${existingVehicle.status} to ${updatedVehicle.status}`,
            userId: assignedToId || undefined,
          })
        }
        if (Current_Location && Current_Location !== existingVehicle.currentLocation) {
          await addTimelineEvent({
            vehicleId: updatedVehicle.id,
            eventType: "LOCATION_CHANGE",
            description: `Location changed from ${existingVehicle.currentLocation} to ${updatedVehicle.currentLocation}`,
            department: updatedVehicle.currentLocation || undefined,
            userId: assignedToId || undefined,
          })
        }
        processedVehicles.push(updatedVehicle)
      } else {
        // Create new vehicle
        const newVehicle = await prisma.vehicle.create({
          data: {
            vin: VIN,
            stockNumber: Stock,
            year: year,
            make: Make,
            model: Model,
            trim: Trim,
            color: Color,
            mileage: mileage,
            status: Status || "IN_PROGRESS",
            currentLocation: Current_Location,
            assignedToId: assignedToId,
            reconditioningCost: reconditioningCost,
            daysInRecon: daysInRecon,
            lastUpdated: Last_Updated ? new Date(Last_Updated) : new Date(),
          },
        })
        await addTimelineEvent({
          vehicleId: newVehicle.id,
          eventType: "CHECK_IN",
          description: `Vehicle checked in. Initial status: ${newVehicle.status}`,
          department: newVehicle.currentLocation || undefined,
          userId: assignedToId || undefined,
        })
        processedVehicles.push(newVehicle)
      }
    }

    return NextResponse.json({ success: true, processedCount: processedVehicles.length })
  } catch (error) {
    console.error("Google Sheets Sync API error:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error occurred" },
      { status: 500 },
    )
  }
}

// This route handler is for fetching data from Google Sheets
// It's typically triggered by the client or a cron job
export async function GET(request: NextRequest) {
  const googleSheetsUrl = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_URL

  if (!googleSheetsUrl) {
    return NextResponse.json({ success: false, error: "Google Sheets URL not configured." }, { status: 500 })
  }

  try {
    // Extract spreadsheet ID and range from the URL
    const urlMatch = googleSheetsUrl.match(/\/d\/([a-zA-Z0-9_-]+)\/edit(?:#gid=(\d+))?/)
    if (!urlMatch || !urlMatch[1]) {
      throw new Error("Invalid Google Sheets URL format.")
    }
    const spreadsheetId = urlMatch[1]
    const gid = urlMatch[2] // Optional gid for specific sheet

    // You'll need to set up Google Cloud credentials for a service account
    // and provide them as environment variables or a key file.
    // For simplicity, this example assumes you have GOOGLE_APPLICATION_CREDENTIALS
    // pointing to a service account key file, or similar setup for authentication.
    // In a real application, you'd use a more robust authentication method.

    const auth = new google.auth.GoogleAuth({
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    })
    const authClient = await auth.getClient()
    const sheets = google.sheets({ version: "v4", auth: authClient as any })

    // Assuming the first sheet, or specify by name/gid if needed
    const range = "Sheet1!A:Z" // Adjust this to your actual sheet name and range

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    })

    const rows = response.data.values
    if (!rows || rows.length === 0) {
      return NextResponse.json({ success: true, data: [] })
    }

    const headers = rows[0]
    const data = rows.slice(1).map((row) => {
      const rowObject: { [key: string]: any } = {}
      headers.forEach((header, index) => {
        rowObject[header] = row[index]
      })
      return rowObject
    })

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Error fetching from Google Sheets:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to fetch data from Google Sheets." },
      { status: 500 },
    )
  }
}

// Helper function to parse CSV line with proper quote handling
function parseCSVLine(line: string): string[] {
  const result = []
  let current = ""
  let inQuotes = false
  let i = 0

  while (i < line.length) {
    const char = line[i]

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Handle escaped quotes (e.g., "" inside a quoted field)
        current += '"'
        i += 2
        continue
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === "," && !inQuotes) {
      result.push(current.trim())
      current = ""
    } else {
      current += char
    }

    i++
  }

  result.push(current.trim())
  // Remove surrounding quotes if present
  return result.map((value) => value.replace(/^"|"$/g, ""))
}

// Helper function to get column value with flexible matching (case-insensitive, multiple names)
function getColumnValue(vehicle: any, possibleNames: string[]): string {
  for (const name of possibleNames) {
    // Try direct match
    if (vehicle[name] !== undefined && vehicle[name] !== null) {
      return String(vehicle[name]).trim()
    }
    // Try case-insensitive match
    const key = Object.keys(vehicle).find((k) => k.toLowerCase() === name.toLowerCase())
    if (key && vehicle[key] !== undefined && vehicle[key] !== null) {
      return String(vehicle[key]).trim()
    }
  }
  return ""
}

// Helper function to parse boolean values from Google Sheets (e.g., "TRUE", "Yes", "1", "✓", "X")
function parseBooleanValue(value: string): boolean {
  if (!value) return false
  const lowerValue = value.toLowerCase().trim()
  return lowerValue === "true" || lowerValue === "yes" || lowerValue === "1" || lowerValue === "✓" || lowerValue === "x"
}

// Helper function to parse integer values, removing non-numeric characters
function parseIntValue(value: string): number {
  if (!value) return 0
  const parsed = Number.parseInt(value.replace(/[^0-9-]/g, "")) // Allow negative numbers if applicable
  return isNaN(parsed) ? 0 : parsed
}

// Helper function to determine vehicle status based on completion flags
function determineStatus(throughShop: boolean, detailComplete: boolean): "in-shop" | "in-detail" | "completed" {
  if (detailComplete) {
    return "completed"
  } else if (throughShop) {
    return "in-detail"
  } else {
    return "in-shop"
  }
}
