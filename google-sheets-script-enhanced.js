// This script is intended to be run in Google Apps Script linked to your Google Sheet.
// It fetches data from vAuto and populates a "Shop Tracker" tab.
// This enhanced version includes more robust error handling and logging.

// Mock objects for local testing environment. In Google Apps Script, these are built-in.
var Logger = console
var ContentService = {
  createTextOutput: (content) => ({
    setContent: function (content) {
      this.content = content
      return this
    },
    setMimeType: function (mimeType) {
      this.mimeType = mimeType
      return this
    },
    getContent: function () {
      return this.content
    },
  }),
  MimeType: {
    JSON: "application/json",
  },
}

var SpreadsheetApp = {
  getActiveSpreadsheet: () => ({
    getSheetByName: (name) => {
      // Mock implementation: return a mock sheet or null
      if (name === "vAuto Feed") {
        return {
          getDataRange: () => ({
            getValues: () => [
              ["Year", "Make", "Model", "Trim", "Stock #", "Color", "VIN", "Inventory Date", "Price"],
              ["2023", "Honda", "Civic", "LX", "ST1001", "White", "1HGCM82633A123456", "2024-01-10", "25000"],
              ["2022", "Toyota", "Corolla", "LE", "ST1002", "Silver", "2T1BURHE0JC123457", "2024-01-12", "23000"],
              ["2023", "Ford", "F-150", "XLT", "ST1003", "Blue", "1FTFW1ET5DFC12345", "2024-01-08", "45000"],
            ],
          }),
        }
      } else if (name === "Shop Tracker") {
        return {
          getName: () => name,
          clearContents: () => {},
          getRange: (row, col, numRows, numCols) => ({
            setValues: (values) => {},
            insertCheckboxes: () => {},
            clearContent: () => {},
            getValue: () => false, // Mock checkbox value
            setValue: (value) => {},
            setNumberFormat: (format) => {},
          }),
          clearDataValidations: () => {},
          setFrozenRows: (rows) => {},
          setColumnWidth: (col, width) => {},
          getConditionalFormatRules: () => [],
          setConditionalFormatRules: (rules) => {},
          getMaxRows: () => 100, // Mock max rows
          getMaxColumns: () => 20, // Mock max columns
        }
      }
      return null
    },
    insertSheet: (name) => ({
      getName: () => name,
      clearContents: () => {},
      getRange: (row, col, numRows, numCols) => ({
        setValues: (values) => {},
        insertCheckboxes: () => {},
        clearContent: () => {},
        getValue: () => false,
        setValue: (value) => {},
        setNumberFormat: (format) => {},
      }),
      clearDataValidations: () => {},
      setFrozenRows: (rows) => {},
      setColumnWidth: (col, width) => {},
      getConditionalFormatRules: () => [],
      setConditionalFormatRules: (rules) => {},
      getMaxRows: () => 100,
      getMaxColumns: () => 20,
    }),
    getSpreadsheetTimeZone: () => "America/New_York",
    getUrl: () => "https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit",
  }),
  getUi: () => ({
    alert: (title, message, buttonSet) => {
      Logger.log(`${title}: ${message}`)
    },
    ButtonSet: { OK: "OK" },
  }),
  newConditionalFormatRule: () => ({
    setRanges: (ranges) => ({
      whenFormulaSatisfied: (formula) => ({
        setBackground: (color) => ({
          build: () => ({}),
        }),
      }),
    }),
  }),
}

var Browser = {
  msgBox: (title, message, buttons) => {
    Logger.log(`${title}: ${message}`)
  },
  Buttons: { OK: "OK" },
}

var Utilities = {
  formatDate: (date, timeZone, format) => {
    const options = { year: "numeric", month: "2-digit", day: "2-digit" }
    return new Date(date).toLocaleDateString("en-US", options)
  },
}

var ScriptApp = {
  getProjectTriggers: () => [],
  deleteTrigger: (trigger) => {},
  newTrigger: (functionName) => ({
    timeBased: function () {
      return this
    },
    everyHours: function (hours) {
      return this
    },
    create: () => {},
  }),
}

var Session = {
  getActiveUser: () => ({
    getEmail: () => "user@example.com",
  }),
}

var MailApp = {
  sendEmail: (to, subject, body) => {
    Logger.log(`Email sent to: ${to} with subject: ${subject} and body: ${body}`)
  },
}

function updateShopTrackerFromVautoEnhanced() {
  const ss = SpreadsheetApp.getActiveSpreadsheet()
  const vautoFeedSheet = ss.getSheetByName("vAuto Feed")
  const shopTrackerSheetName = "Shop Tracker"

  if (!vautoFeedSheet) {
    Logger.log("Error: 'vAuto Feed' sheet not found.")
    Browser.msgBox("Error", "'vAuto Feed' sheet not found. Please ensure it exists.", Browser.Buttons.OK)
    return
  }

  const vautoData = vautoFeedSheet.getDataRange().getValues()
  if (vautoData.length < 2) {
    Logger.log("Error: 'vAuto Feed' sheet is empty or has no data rows.")
    Browser.msgBox("Error", "'vAuto Feed' sheet is empty or has no data rows.", Browser.Buttons.OK)
    return
  }

  const vautoHeaders = vautoData[0]
  const vautoRows = vautoData.slice(1)

  // Find column indices (case-insensitive and flexible matching)
  const getColIndex = (headers, possibleNames) => {
    for (const name of possibleNames) {
      const index = headers.findIndex((h) => h.toLowerCase().includes(name.toLowerCase()))
      if (index !== -1) return index
    }
    return -1
  }

  const stockNumCol = getColIndex(vautoHeaders, ["Stock #", "Stock", "Stock Number"])
  const vinCol = getColIndex(vautoHeaders, ["VIN", "Vin"])
  const yearCol = getColIndex(vautoHeaders, ["Year", "Model Year"])
  const makeCol = getColIndex(vautoHeaders, ["Make", "Manufacturer"])
  const modelCol = getColIndex(vautoHeaders, ["Model", "Model Name"])
  const inventoryDateCol = getColIndex(vautoHeaders, ["Inventory Date", "Date In", "In Stock Date"])

  if (stockNumCol === -1 || vinCol === -1) {
    Logger.log("Error: Required columns (Stock #, VIN) not found in 'vAuto Feed' sheet.")
    Browser.msgBox(
      "Error",
      "Required columns (Stock #, VIN) not found in 'vAuto Feed' sheet. Please check your vAuto data.",
      Browser.Buttons.OK,
    )
    return
  }

  // Prepare data for Shop Tracker sheet
  const shopTrackerHeaders = [
    "Stock #",
    "VIN",
    "Year",
    "Make",
    "Model",
    "Inventory Date",
    "Through Shop",
    "Shop Done Date",
    "Detail Complete",
    "Detail Done Date",
    "Days in Inventory",
    "Days to Shop",
    "Days to Detail",
    "Status",
  ]

  const shopTrackerData = [shopTrackerHeaders]
  let processedCount = 0
  let errorCount = 0

  vautoRows.forEach((row, index) => {
    try {
      const stockNum = row[stockNumCol] || ""
      const vin = row[vinCol] || ""

      if (!stockNum || !vin) {
        Logger.log(`Skipping row ${index + 2}: Missing Stock # or VIN.`)
        errorCount++
        return
      }

      const year = row[yearCol] || ""
      const make = row[makeCol] || ""
      const model = row[modelCol] || ""
      const inventoryDate = row[inventoryDateCol]
        ? Utilities.formatDate(new Date(row[inventoryDateCol]), ss.getSpreadsheetTimeZone(), "yyyy-MM-dd")
        : ""

      // Simulate recon status (these would ideally come from another system or manual input)
      const throughShop = "FALSE" // Default to false, can be updated manually or by another script
      const shopDoneDate = ""
      const detailComplete = "FALSE" // Default to false
      const detailDoneDate = ""

      // Calculate days in inventory (simple calculation for demo)
      let daysInInventory = ""
      if (inventoryDate) {
        const invDate = new Date(inventoryDate)
        const today = new Date()
        const diffTime = Math.abs(today.getTime() - invDate.getTime())
        daysInInventory = Math.ceil(diffTime / (1000 * 60 * 60 * 24)).toString()
      }

      const daysToShop = "" // Placeholder
      const daysToDetail = "" // Placeholder
      const status = "Pending" // Placeholder

      shopTrackerData.push([
        stockNum,
        vin,
        year,
        make,
        model,
        inventoryDate,
        throughShop,
        shopDoneDate,
        detailComplete,
        detailDoneDate,
        daysInInventory,
        daysToShop,
        daysToDetail,
        status,
      ])
      processedCount++
    } catch (e) {
      Logger.log(`Error processing row ${index + 2}: ${e.message}`)
      errorCount++
    }
  })

  // Get or create the Shop Tracker sheet
  let shopTrackerSheet = ss.getSheetByName(shopTrackerSheetName)
  if (!shopTrackerSheet) {
    shopTrackerSheet = ss.insertSheet(shopTrackerSheetName)
    Logger.log(`Created new sheet: ${shopTrackerSheetName}`)
  } else {
    // Clear existing content if sheet already exists
    shopTrackerSheet.clearContents()
    Logger.log(`Cleared existing content in sheet: ${shopTrackerSheetName}`)
  }

  // Write data to Shop Tracker sheet
  if (shopTrackerData.length > 1) {
    // Check if there's data beyond just headers
    shopTrackerSheet.getRange(1, 1, shopTrackerData.length, shopTrackerData[0].length).setValues(shopTrackerData)
    Logger.log(`Successfully updated '${shopTrackerSheetName}' with ${processedCount} vehicle records.`)
    Browser.msgBox(
      "Success",
      `'${shopTrackerSheetName}' updated successfully with ${processedCount} vehicle records. ${errorCount > 0 ? `(${errorCount} rows skipped due to errors)` : ""}`,
      Browser.Buttons.OK,
    )
  } else {
    Logger.log(`No valid vehicle records to write to '${shopTrackerSheetName}'.`)
    Browser.msgBox(
      "Warning",
      `No valid vehicle records found to update '${shopTrackerSheetName}'. ${errorCount > 0 ? `(${errorCount} rows skipped due to errors)` : ""}`,
      Browser.Buttons.OK,
    )
  }
}

/**
 * This Google Apps Script is designed to be deployed as a web app
 * to allow external services (like your Next.js app) to read and write data
 * to a Google Sheet.
 *
 * To deploy:
 * 1. Go to Extensions > Apps Script in your Google Sheet.
 * 2. Copy and paste this code.
 * 3. Save the project.
 * 4. Click "Deploy" > "New deployment".
 * 5. Select "Web app" as the type.
 * 6. Set "Execute as" to "Me" (your Google account).
 * 7. Set "Who has access" to "Anyone" (or "Anyone, even anonymous" if no authentication is needed).
 *    WARNING: "Anyone" means anyone with the URL can access. Consider adding API key validation.
 * 8. Click "Deploy".
 * 9. Copy the "Web app URL" and use it as NEXT_PUBLIC_GOOGLE_SHEETS_URL in your .env.local.
 */

function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet()
  var data = sheet.getDataRange().getValues()
  var headers = data[0]
  var rows = data.slice(1)

  var result = []
  for (var i = 0; i < rows.length; i++) {
    var row = rows[i]
    var obj = {}
    for (var j = 0; j < headers.length; j++) {
      obj[headers[j]] = row[j]
    }
    result.push(obj)
  }

  return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON)
}

function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet()
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]

  try {
    var requestBody = JSON.parse(e.postData.contents)
    var dataToAppend = requestBody.data // Expecting an array of objects

    if (!Array.isArray(dataToAppend)) {
      return ContentService.createTextOutput(
        JSON.stringify({ error: 'Invalid request body: "data" must be an array.' }),
      )
        .setMimeType(ContentService.MimeType.JSON)
        .setStatusCode(400)
    }

    var valuesToAppend = []
    for (var i = 0; i < dataToAppend.length; i++) {
      var rowData = dataToAppend[i]
      var newRow = []
      for (var j = 0; j < headers.length; j++) {
        newRow.push(rowData[headers[j]] || "") // Map data to columns, use empty string if not present
      }
      valuesToAppend.push(newRow)
    }

    if (valuesToAppend.length > 0) {
      sheet
        .getRange(sheet.getLastRow() + 1, 1, valuesToAppend.length, valuesToAppend[0].length)
        .setValues(valuesToAppend)
    }

    return ContentService.createTextOutput(
      JSON.stringify({ success: true, appendedCount: valuesToAppend.length }),
    ).setMimeType(ContentService.MimeType.JSON)
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ error: error.message }))
      .setMimeType(ContentService.MimeType.JSON)
      .setStatusCode(500)
  }
}

/**
 * Example of how to add a simple API key for basic security.
 * This is NOT robust security, but better than nothing for public access.
 *
 * To use:
 * 1. Define a script property named 'API_KEY' with your secret key.
 *    (File > Project properties > Script properties tab)
 * 2. In your Next.js app, send this key in a header (e.g., 'X-API-Key').
 *
 * function doGet(e) {
 *   var API_KEY = PropertiesService.getScriptProperties().getProperty('API_KEY');
 *   if (e.parameter.api_key !== API_KEY) { // Or check headers: e.parameter.headers['X-API-Key']
 *     return ContentService.createTextOutput(JSON.stringify({ error: 'Unauthorized' }))
 *       .setMimeType(ContentService.MimeType.JSON)
 *       .setStatusCode(401);
 *   }
 *   // ... rest of the doGet logic ...
 * }
 *
 * function doPost(e) {
 *   var API_KEY = PropertiesService.getScriptProperties().getProperty('API_KEY');
 *   var requestHeaders = JSON.parse(e.postData.contents).headers; // Assuming headers are part of the JSON body for simplicity
 *   if (!requestHeaders || requestHeaders['X-API-Key'] !== API_KEY) {
 *     return ContentService.createTextOutput(JSON.stringify({ error: 'Unauthorized' }))
 *       .setMimeType(ContentService.MimeType.JSON)
 *       .setStatusCode(401);
 *   }
 *   // ... rest of the doPost logic ...
 * }
 */
