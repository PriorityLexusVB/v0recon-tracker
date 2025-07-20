import { type NextRequest, NextResponse } from "next/server"

interface Vehicle {
  id: string
  vin: string
  year: string
  make: string
  model: string
  inventoryDate: string
  throughShop: boolean
  shopDoneDate: string
  detailComplete: boolean
  detailDoneDate: string
  daysInInventory: number
  daysToShop: number
  daysToDetail: number
  status: "in-shop" | "in-detail" | "completed"
}

export async function GET(request: NextRequest) {
  const startTime = Date.now()

  try {
    const sheetsUrl = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_URL

    if (!sheetsUrl) {
      return NextResponse.json(
        {
          success: false,
          error: "Google Sheets URL not configured",
          details: "Add NEXT_PUBLIC_GOOGLE_SHEETS_URL to your environment variables",
          troubleshooting: [
            "1. Create a .env.local file in your project root",
            "2. Add: NEXT_PUBLIC_GOOGLE_SHEETS_URL=your_sheet_url",
            "3. Restart your development server",
            "4. Make sure the URL is your Google Sheet's sharing URL",
          ],
        },
        { status: 500 },
      )
    }

    // Extract spreadsheet ID from URL
    const spreadsheetId = sheetsUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)?.[1]

    if (!spreadsheetId) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid Google Sheets URL format",
          details: `URL: ${sheetsUrl}`,
          troubleshooting: [
            "1. Make sure the URL is from Google Sheets",
            "2. URL should contain '/spreadsheets/d/SHEET_ID'",
            "3. Use the sharing URL from your Google Sheet",
            "4. Example: https://docs.google.com/spreadsheets/d/SHEET_ID/edit?usp=sharing",
          ],
        },
        { status: 400 },
      )
    }

    console.log(`[${new Date().toISOString()}] Fetching data from spreadsheet: ${spreadsheetId}`)

    // Try different GID values to find the Shop Tracker tab
    const possibleGids = ["0", "1", "2", "1234567890", "123456789", ""]
    let csvData = null
    let usedGid = null
    let headers: string[] = []
    const attemptLog: string[] = []

    for (const gid of possibleGids) {
      try {
        const csvUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv${gid ? `&gid=${gid}` : ""}`
        attemptLog.push(`Trying GID ${gid}: ${csvUrl}`)

        const response = await fetch(csvUrl, {
          headers: {
            "User-Agent": "ReconTracker/1.0",
            Accept: "text/csv",
          },
        })

        if (response.ok) {
          const text = await response.text()

          if (text && text.trim().length > 0) {
            const lines = text.split("\n").filter((line) => line.trim())
            if (lines.length > 0) {
              const testHeaders = parseCSVLine(lines[0])

              // Check if this looks like the Shop Tracker tab
              const hasShopColumns = testHeaders.some(
                (h) =>
                  h.toLowerCase().includes("through shop") ||
                  h.toLowerCase().includes("detail complete") ||
                  h.toLowerCase().includes("days in inventory") ||
                  h.toLowerCase().includes("shop done") ||
                  h.toLowerCase().includes("detail done"),
              )

              if (hasShopColumns) {
                csvData = text
                usedGid = gid
                headers = testHeaders
                attemptLog.push(`✅ Found Shop Tracker tab with GID: ${gid}`)
                console.log(`[${new Date().toISOString()}] Found Shop Tracker tab with GID: ${gid}`)
                break
              } else {
                attemptLog.push(
                  `❌ GID ${gid} doesn't appear to be Shop Tracker tab (found: ${testHeaders.slice(0, 3).join(", ")})`,
                )
              }
            }
          }
        } else {
          attemptLog.push(`❌ GID ${gid} failed with status: ${response.status} ${response.statusText}`)
        }
      } catch (error) {
        attemptLog.push(`❌ GID ${gid} error: ${error instanceof Error ? error.message : "Unknown error"}`)
        continue
      }
    }

    if (!csvData) {
      console.log(`[${new Date().toISOString()}] Could not find Shop Tracker tab`)
      return NextResponse.json(
        {
          success: false,
          error: "Could not access Shop Tracker tab",
          details: "Make sure your Google Apps Script has run and populated the Shop Tracker tab",
          troubleshooting: [
            "1. Open your Google Sheet in a new tab",
            "2. Go to Extensions > Apps Script",
            "3. Run the updateShopTrackerFromVauto() function",
            "4. Check that the Shop Tracker tab has data with 'Through Shop' and 'Detail Complete' columns",
            "5. Make sure the sheet is shared publicly (Anyone with the link can view)",
            "6. Verify the vAuto Feed tab contains vehicle data",
          ],
          attemptLog,
        },
        { status: 404 },
      )
    }

    // Parse CSV data
    const lines = csvData.split("\n").filter((line) => line.trim())

    if (lines.length < 2) {
      return NextResponse.json(
        {
          success: false,
          error: "Sheet appears to be empty",
          details: "No data rows found in the Shop Tracker tab",
          troubleshooting: [
            "1. Make sure your vAuto Feed tab has vehicle data",
            "2. Run your Google Apps Script to populate Shop Tracker",
            "3. Check that the script completed successfully",
            "4. Verify the Shop Tracker tab was created",
          ],
        },
        { status: 400 },
      )
    }

    const vehicles: Vehicle[] = []
    const parseErrors: string[] = []

    // Parse each data row
    for (let i = 1; i < lines.length; i++) {
      try {
        const values = parseCSVLine(lines[i])

        if (values.length >= headers.length && values[0]) {
          const vehicle: any = {}
          headers.forEach((header, index) => {
            vehicle[header] = values[index] || ""
          })

          // Map to our standard format with flexible column name matching
          const standardVehicle: Vehicle = {
            id: getColumnValue(vehicle, ["Stock #", "Stock", "Stock Number"]) || "",
            vin: getColumnValue(vehicle, ["VIN", "Vin"]) || "",
            year: getColumnValue(vehicle, ["Year", "Model Year"]) || "",
            make: getColumnValue(vehicle, ["Make", "Manufacturer"]) || "",
            model: getColumnValue(vehicle, ["Model", "Model Name"]) || "",
            inventoryDate: getColumnValue(vehicle, ["Inventory Date", "Date In", "In Stock Date"]) || "",
            throughShop: parseBooleanValue(getColumnValue(vehicle, ["Through Shop", "Shop Complete", "Shop Done"])),
            shopDoneDate: getColumnValue(vehicle, ["Shop Done Date", "Shop Complete Date", "Shop Finished"]) || "",
            detailComplete: parseBooleanValue(getColumnValue(vehicle, ["Detail Complete", "Detail Done", "Detailed"])),
            detailDoneDate:
              getColumnValue(vehicle, ["Detail Done Date", "Detail Complete Date", "Detail Finished"]) || "",
            daysInInventory: parseIntValue(
              getColumnValue(vehicle, ["Days in Inventory", "Days In Stock", "Inventory Days"]),
            ),
            daysToShop: parseIntValue(getColumnValue(vehicle, ["Days to Shop", "Shop Days", "Days Until Shop"])),
            daysToDetail: parseIntValue(
              getColumnValue(vehicle, ["Days to Detail", "Detail Days", "Days Until Detail"]),
            ),
            status: determineStatus(
              parseBooleanValue(getColumnValue(vehicle, ["Through Shop", "Shop Complete", "Shop Done"])),
              parseBooleanValue(getColumnValue(vehicle, ["Detail Complete", "Detail Done", "Detailed"])),
            ),
          }

          // Only include vehicles with required data
          if (standardVehicle.id && standardVehicle.vin) {
            vehicles.push(standardVehicle)
          } else if (standardVehicle.id || standardVehicle.vin) {
            parseErrors.push(`Row ${i}: Missing ${!standardVehicle.id ? "Stock #" : "VIN"}`)
          }
        }
      } catch (error) {
        parseErrors.push(`Row ${i}: ${error instanceof Error ? error.message : "Parse error"}`)
        continue
      }
    }

    const responseTime = Date.now() - startTime

    console.log(`[${new Date().toISOString()}] Successfully parsed ${vehicles.length} vehicles in ${responseTime}ms`)

    return NextResponse.json({
      success: true,
      gidUsed: usedGid,
      totalVehicles: vehicles.length,
      headers: headers,
      vehicles: vehicles,
      responseTime: responseTime,
      lastUpdated: new Date().toISOString(),
      integration: "vAuto via Google Apps Script",
      parseErrors: parseErrors.length > 0 ? parseErrors.slice(0, 10) : undefined, // Limit error reporting
      dataQuality: {
        totalRows: lines.length - 1,
        successfullyParsed: vehicles.length,
        parseErrorCount: parseErrors.length,
        completionRate:
          vehicles.length > 0
            ? Math.round((vehicles.filter((v) => v.status === "completed").length / vehicles.length) * 100)
            : 0,
      },
    })
  } catch (error) {
    const responseTime = Date.now() - startTime
    console.error(`[${new Date().toISOString()}] Google Sheets API Error:`, error)

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch data from Google Sheets",
        details: error instanceof Error ? error.message : "Unknown error",
        responseTime: responseTime,
        troubleshooting: [
          "1. Check your internet connection",
          "2. Verify the Google Sheet URL is correct",
          "3. Make sure the sheet is publicly accessible",
          "4. Try running your Google Apps Script again",
          "5. Check the browser console for more details",
        ],
      },
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
        // Handle escaped quotes
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
  return result.map((value) => value.replace(/^"|"$/g, ""))
}

// Helper function to get column value with flexible matching
function getColumnValue(vehicle: any, possibleNames: string[]): string {
  for (const name of possibleNames) {
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

// Helper function to parse boolean values from Google Sheets
function parseBooleanValue(value: string): boolean {
  if (!value) return false
  const lowerValue = value.toLowerCase().trim()
  return lowerValue === "true" || lowerValue === "yes" || lowerValue === "1" || lowerValue === "✓" || lowerValue === "x"
}

// Helper function to parse integer values
function parseIntValue(value: string): number {
  if (!value) return 0
  const parsed = Number.parseInt(value.replace(/[^0-9-]/g, ""))
  return isNaN(parsed) ? 0 : parsed
}

// Helper function to determine vehicle status
function determineStatus(throughShop: boolean, detailComplete: boolean): "in-shop" | "in-detail" | "completed" {
  if (detailComplete) {
    return "completed"
  } else if (throughShop) {
    return "in-detail"
  } else {
    return "in-shop"
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log(`[${new Date().toISOString()}] Google Sheets POST request:`, body)

    // This endpoint could be used for webhook updates from Google Sheets
    // or for manual data sync triggers in the future

    return NextResponse.json({
      success: true,
      message: "Data received successfully",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Google Sheets POST error:`, error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}
