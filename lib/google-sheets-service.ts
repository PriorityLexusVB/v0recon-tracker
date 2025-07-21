import { google } from "googleapis"

// This service handles direct interaction with Google Sheets API
// It's designed to be used on the server-side (e.g., in API routes or server actions)
// as it requires sensitive credentials.

interface SheetRow {
  [key: string]: string | number | boolean | null
}

/**
 * Fetches data from a Google Sheet.
 * Requires GOOGLE_APPLICATION_CREDENTIALS environment variable pointing to a service account key file
 * or other GoogleAuth compatible authentication.
 *
 * @param spreadsheetId The ID of the Google Spreadsheet.
 * @param range The A1 notation of the range to retrieve values from (e.g., 'Sheet1!A:Z').
 * @returns An array of objects, where each object represents a row and keys are column headers.
 */
export async function fetchGoogleSheetData(spreadsheetId: string, range: string): Promise<SheetRow[]> {
  try {
    const auth = new google.auth.GoogleAuth({
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    })
    const authClient = await auth.getClient()
    const sheets = google.sheets({ version: "v4", auth: authClient as any })

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    })

    const rows = response.data.values
    if (!rows || rows.length === 0) {
      return []
    }

    const headers = rows[0]
    const data = rows.slice(1).map((row) => {
      const rowObject: SheetRow = {}
      headers.forEach((header, index) => {
        rowObject[header] = row[index] === "" ? null : row[index] // Treat empty strings as null
      })
      return rowObject
    })

    return data
  } catch (error) {
    console.error("Error fetching from Google Sheets:", error)
    throw new Error(
      `Failed to fetch data from Google Sheets: ${error instanceof Error ? error.message : "Unknown error"}`,
    )
  }
}

/**
 * Appends data to a Google Sheet.
 * Requires GOOGLE_APPLICATION_CREDENTIALS environment variable or similar write access.
 *
 * @param spreadsheetId The ID of the Google Spreadsheet.
 * @param range The A1 notation of the range to append values to (e.g., 'Sheet1!A:Z').
 * @param values An array of arrays, where each inner array is a row of values to append.
 * @returns The number of cells updated.
 */
export async function appendGoogleSheetData(spreadsheetId: string, range: string, values: any[][]): Promise<number> {
  try {
    const auth = new google.auth.GoogleAuth({
      scopes: ["https://www.googleapis.com/auth/spreadsheets"], // Need write scope
    })
    const authClient = await auth.getClient()
    const sheets = google.sheets({ version: "v4", auth: authClient as any })

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: "RAW", // How input data should be interpreted
      requestBody: {
        values: values,
      },
    })

    return response.data.updates?.updatedCells || 0
  } catch (error) {
    console.error("Error appending to Google Sheets:", error)
    throw new Error(
      `Failed to append data to Google Sheets: ${error instanceof Error ? error.message : "Unknown error"}`,
    )
  }
}

/**
 * Updates data in a Google Sheet.
 *
 * @param spreadsheetId The ID of the Google Spreadsheet.
 * @param range The A1 notation of the range to update (e.g., 'Sheet1!A1:B2').
 * @param values An array of arrays, where each inner array is a row of values to update.
 * @returns The number of cells updated.
 */
export async function updateGoogleSheetData(spreadsheetId: string, range: string, values: any[][]): Promise<number> {
  try {
    const auth = new google.auth.GoogleAuth({
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    })
    const authClient = await auth.getClient()
    const sheets = google.sheets({ version: "v4", auth: authClient as any })

    const response = await sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: "RAW",
      requestBody: {
        values: values,
      },
    })

    return response.data.updatedCells || 0
  } catch (error) {
    console.error("Error updating Google Sheets:", error)
    throw new Error(
      `Failed to update data in Google Sheets: ${error instanceof Error ? error.message : "Unknown error"}`,
    )
  }
}
