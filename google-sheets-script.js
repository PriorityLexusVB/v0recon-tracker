// Google Apps Script for Recon Tracker Integration
// This script connects your vAuto inventory feed to the Recon Tracker system
//
// Setup Instructions:
// 1. Create a Google Sheet with two tabs: "vAuto Feed" and "Shop Tracker"
// 2. Import your vAuto data into the "vAuto Feed" tab
// 3. Run updateShopTrackerFromVauto() to populate the "Shop Tracker" tab
// 4. Set up a time-based trigger to run this function automatically

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

function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Recon")

    // Create the sheet if it doesn't exist
    if (!sheet) {
      const newSheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet("Recon")
      // Add headers
      newSheet
        .getRange(1, 1, 1, 10)
        .setValues([
          ["VIN", "Stock", "Make", "Model", "Year", "Status", "Shop Done", "Detail Done", "Photo Done", "Last Updated"],
        ])
    }

    const data = JSON.parse(e.postData.contents)

    // Check if vehicle already exists
    const existingData = sheet.getDataRange().getValues()
    let rowIndex = -1

    for (let i = 1; i < existingData.length; i++) {
      if (existingData[i][0] === data.vin) {
        rowIndex = i + 1
        break
      }
    }

    const rowData = [
      data.vin,
      data.stock,
      data.make,
      data.model,
      data.year,
      data.status,
      data.shopDone,
      data.detailDone,
      data.photoDone,
      new Date(),
    ]

    if (rowIndex > 0) {
      // Update existing row
      sheet.getRange(rowIndex, 1, 1, 10).setValues([rowData])
    } else {
      // Add new row
      sheet.appendRow(rowData)
    }

    return ContentService.createTextOutput(JSON.stringify({ success: true })).setMimeType(ContentService.MimeType.JSON)
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: error.toString() })).setMimeType(
      ContentService.MimeType.JSON,
    )
  }
}

function updateShopTrackerFromVauto() {
  const trackerSheetName = "Shop Tracker"
  const feedSheetName = "vAuto Feed"
  const ss = SpreadsheetApp.getActiveSpreadsheet()
  const feedSheet = ss.getSheetByName(feedSheetName)
  const trackerSheet = ss.getSheetByName(trackerSheetName) || ss.insertSheet(trackerSheetName)

  // Validate that the feed sheet exists
  if (!feedSheet) {
    throw new Error(`Sheet "${feedSheetName}" not found. Please create it and import your vAuto data.`)
  }

  const feedData = feedSheet.getDataRange().getValues()

  // Define the exact header structure expected by Recon Tracker
  const header = [
    "Inventory Date",
    "Stock #",
    "Year",
    "Make",
    "Model",
    "VIN",
    "Through Shop",
    "Shop Done Date",
    "Detail Complete",
    "Detail Done Date",
    "Days in Inventory",
    "Days to Shop",
    "Days to Detail",
  ]

  // Backup existing status data by VIN to preserve manual updates
  const trackerData = trackerSheet.getDataRange().getValues()
  const trackerMap = {}

  // Build a map of existing vehicle status by VIN
  for (let i = 1; i < trackerData.length; i++) {
    const vin = trackerData[i][5] // VIN is in column F (index 5)
    if (vin) {
      trackerMap[vin] = {
        shop: trackerData[i][6], // Through Shop checkbox
        shopDate: trackerData[i][7], // Shop Done Date
        detail: trackerData[i][8], // Detail Complete checkbox
        detailDate: trackerData[i][9], // Detail Done Date
      }
    }
  }

  const today = new Date()
  const newTracker = [header]

  // Process each vehicle from the vAuto feed
  for (let i = 1; i < feedData.length; i++) {
    const row = feedData[i]

    // Map vAuto feed columns to tracker columns
    // Adjust these indices based on your vAuto feed structure
    const inventoryDate = row[7] // Adjust index as needed
    const stock = row[4] // Adjust index as needed
    const year = row[0] // Adjust index as needed
    const make = row[1] // Adjust index as needed
    const model = row[2] // Adjust index as needed
    const vin = row[6] // Adjust index as needed

    // Skip rows without essential data
    if (!vin || !stock) continue

    // Get existing status or default values
    const existing = trackerMap[vin] || {}

    // Calculate days in inventory
    const daysInInventory = inventoryDate ? Math.floor((today - new Date(inventoryDate)) / (1000 * 60 * 60 * 24)) : ""

    // Calculate days to shop completion
    const daysToShop =
      existing.shopDate && inventoryDate
        ? Math.floor(
            (new Date(existing.shopDate).getTime() - new Date(inventoryDate).getTime()) / (1000 * 60 * 60 * 24),
          )
        : ""

    // Calculate days to detail completion
    const daysToDetail =
      existing.detailDate && inventoryDate
        ? Math.floor(
            (new Date(existing.detailDate).getTime() - new Date(inventoryDate).getTime()) / (1000 * 60 * 60 * 24),
          )
        : ""

    // Build the tracker row
    newTracker.push([
      inventoryDate,
      stock,
      year,
      make,
      model,
      vin,
      existing.shop || false, // Preserve existing shop status
      existing.shopDate || "", // Preserve existing shop date
      existing.detail || false, // Preserve existing detail status
      existing.detailDate || "", // Preserve existing detail date
      daysInInventory,
      daysToShop,
      daysToDetail,
    ])
  }

  // Sort by Inventory Date (oldest first) for better workflow management
  newTracker.splice(
    1,
    newTracker.length - 1,
    ...newTracker.slice(1).sort((a, b) => {
      const dateA = new Date(a[0])
      const dateB = new Date(b[0])
      return dateA - dateB
    }),
  )

  // Clear existing data while preserving manual formatting
  trackerSheet.clearContents()
  trackerSheet.getRange(1, 1, trackerSheet.getMaxRows(), trackerSheet.getMaxColumns()).clearDataValidations()

  // Write the new data
  const numRows = newTracker.length
  const numCols = newTracker[0].length
  trackerSheet.getRange(1, 1, numRows, numCols).setValues(newTracker)

  // Reapply interactive elements
  if (numRows > 1) {
    // Add checkboxes for "Through Shop" column (G)
    trackerSheet.getRange(2, 7, numRows - 1, 1).insertCheckboxes()

    // Add checkboxes for "Detail Complete" column (I)
    trackerSheet.getRange(2, 9, numRows - 1, 1).insertCheckboxes()
  }

  // Apply formatting for better usability
  trackerSheet.setFrozenRows(1)
  trackerSheet.getRange(1, 1, 1, numCols).setFontWeight("bold")

  // Set optimal column widths
  const columnWidths = [120, 90, 60, 90, 100, 220, 110, 120, 110, 120, 130, 110, 110]
  columnWidths.forEach((width, index) => {
    trackerSheet.setColumnWidth(index + 1, width)
  })

  // Add conditional formatting for overdue vehicles (more than 7 days)
  const overdueRule = SpreadsheetApp.newConditionalFormatRule()
    .setRanges([trackerSheet.getRange(2, 1, numRows - 1, numCols)])
    .whenFormulaSatisfied("=$K2>7") // Days in Inventory > 7
    .setBackground("#ffebee") // Light red background
    .build()

  const rules = trackerSheet.getConditionalFormatRules()
  rules.push(overdueRule)
  trackerSheet.setConditionalFormatRules(rules)

  // Log success
  console.log(`Successfully updated Shop Tracker with ${numRows - 1} vehicles`)

  // Optional: Send notification email
  // sendUpdateNotification(numRows - 1);
}

/**
 * Handles checkbox changes and automatically updates completion dates
 * This function runs automatically when users edit the sheet
 */
function onEdit(e) {
  const sheet = e.range.getSheet()

  // Only process edits on the Shop Tracker sheet
  if (sheet.getName() !== "Shop Tracker") return

  const col = e.range.getColumn()
  const row = e.range.getRow()

  // Skip header row
  if (row === 1) return

  // Handle "Through Shop" checkbox (column G)
  if (col === 7) {
    const shopDateCell = sheet.getRange(row, 8) // Shop Done Date column (H)

    if (e.value === true || e.value === "TRUE") {
      // Shop completed - set date if not already set
      if (!shopDateCell.getValue()) {
        shopDateCell.setValue(new Date()).setNumberFormat("MM/dd/yyyy")
      }
    } else if (e.value === false || e.value === "FALSE") {
      // Shop not completed - clear date
      shopDateCell.clearContent()

      // Also clear detail status since shop must be done first
      const detailCheckbox = sheet.getRange(row, 9)
      const detailDateCell = sheet.getRange(row, 10)
      detailCheckbox.setValue(false)
      detailDateCell.clearContent()
    }
  }

  // Handle "Detail Complete" checkbox (column I)
  if (col === 9) {
    const detailDateCell = sheet.getRange(row, 10) // Detail Done Date column (J)
    const shopCheckbox = sheet.getRange(row, 7) // Through Shop checkbox

    if (e.value === true || e.value === "TRUE") {
      // Detail completed - check if shop is done first
      if (!shopCheckbox.getValue()) {
        // Shop not done - show warning and prevent detail completion
        SpreadsheetApp.getUi().alert(
          "Shop Required",
          "Vehicle must go through shop before detail can be completed.",
          SpreadsheetApp.getUi().ButtonSet.OK,
        )
        e.range.setValue(false)
        return
      }

      // Set detail completion date if not already set
      if (!detailDateCell.getValue()) {
        detailDateCell.setValue(new Date()).setNumberFormat("MM/dd/yyyy")
      }
    } else if (e.value === false || e.value === "FALSE") {
      // Detail not completed - clear date
      detailDateCell.clearContent()
    }
  }

  // Recalculate days columns when dates change
  if (col === 8 || col === 10) {
    // Shop Done Date or Detail Done Date
    recalculateDaysForRow(sheet, row)
  }
}

/**
 * Recalculates the days columns for a specific row
 */
function recalculateDaysForRow(sheet, row) {
  const inventoryDate = sheet.getRange(row, 1).getValue() // Column A
  const shopDate = sheet.getRange(row, 8).getValue() // Column H
  const detailDate = sheet.getRange(row, 10).getValue() // Column J

  if (!inventoryDate) return

  const today = new Date()
  const invDate = new Date(inventoryDate)

  // Days in inventory
  const daysInInventory = Math.floor((today - invDate) / (1000 * 60 * 60 * 24))
  sheet.getRange(row, 11).setValue(daysInInventory)

  // Days to shop
  if (shopDate) {
    const daysToShop = Math.floor((new Date(shopDate) - invDate) / (1000 * 60 * 60 * 24))
    sheet.getRange(row, 12).setValue(daysToShop)
  } else {
    sheet.getRange(row, 12).setValue("")
  }

  // Days to detail
  if (detailDate) {
    const daysToDetail = Math.floor((new Date(detailDate) - invDate) / (1000 * 60 * 60 * 24))
    sheet.getRange(row, 13).setValue(daysToDetail)
  } else {
    sheet.getRange(row, 13).setValue("")
  }
}

/**
 * Sets up automatic triggers for the sheet
 * Run this once to set up automatic updates
 */
function setupTriggers() {
  // Delete existing triggers
  const triggers = ScriptApp.getProjectTriggers()
  triggers.forEach((trigger) => {
    if (trigger.getHandlerFunction() === "updateShopTrackerFromVauto") {
      ScriptApp.deleteTrigger(trigger)
    }
  })

  // Create new trigger to run every hour during business hours
  ScriptApp.newTrigger("updateShopTrackerFromVauto").timeBased().everyHours(1).create()

  console.log("Automatic update trigger created - will run every hour")
}

/**
 * Manual function to test the integration
 */
function testIntegration() {
  try {
    updateShopTrackerFromVauto()
    console.log("✅ Integration test successful!")

    // Test data validation
    const ss = SpreadsheetApp.getActiveSpreadsheet()
    const trackerSheet = ss.getSheetByName("Shop Tracker")
    const data = trackerSheet.getDataRange().getValues()

    console.log(`📊 Loaded ${data.length - 1} vehicles`)
    console.log("🔗 Ready for Recon Tracker connection")
  } catch (error) {
    console.error("❌ Integration test failed:", error.toString())
    throw error
  }
}

/**
 * Optional: Send email notification when data is updated
 */
function sendUpdateNotification(vehicleCount) {
  const email = Session.getActiveUser().getEmail()
  const subject = "Recon Tracker - Data Updated"
  const body = `
    Your Shop Tracker has been updated with ${vehicleCount} vehicles.
    
    View your data: ${SpreadsheetApp.getActiveSpreadsheet().getUrl()}
    
    The data is now ready for the Recon Tracker mobile app.
  `

  try {
    MailApp.sendEmail(email, subject, body)
  } catch (error) {
    console.log("Could not send notification email:", error.toString())
  }
}

/**
 * Creates sample data for testing (optional)
 */
function createSampleData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet()
  let feedSheet = ss.getSheetByName("vAuto Feed")

  if (!feedSheet) {
    feedSheet = ss.insertSheet("vAuto Feed")
  }

  // Sample vAuto data structure
  const sampleData = [
    ["Year", "Make", "Model", "Trim", "Stock", "Color", "VIN", "Inventory Date", "Price"],
    ["2023", "Honda", "Civic", "LX", "ST1001", "White", "1HGCM82633A123456", "2024-01-10", "25000"],
    ["2022", "Toyota", "Corolla", "LE", "ST1002", "Silver", "2T1BURHE0JC123457", "2024-01-12", "23000"],
    ["2023", "Ford", "F-150", "XLT", "ST1003", "Blue", "1FTFW1ET5DFC12345", "2024-01-08", "45000"],
    ["2023", "Chevrolet", "Silverado", "LT", "ST1004", "Black", "1GCUYDED5NZ123456", "2024-01-14", "48000"],
    ["2022", "Nissan", "Altima", "S", "ST1005", "Red", "1N4BL4BV4NC123456", "2024-01-06", "26000"],
  ]

  feedSheet.clear()
  feedSheet.getRange(1, 1, sampleData.length, sampleData[0].length).setValues(sampleData)
  feedSheet.getRange(1, 1, 1, sampleData[0].length).setFontWeight("bold")

  console.log("✅ Sample vAuto data created")
}

// Test function to verify the script works
function testDoPost() {
  const testData = {
    postData: {
      contents: JSON.stringify({
        vin: "TEST123456789",
        stock: "ST1001",
        make: "Toyota",
        model: "Camry",
        year: 2022,
        status: "In Progress",
        shopDone: "2024-01-15",
        detailDone: "",
        photoDone: "",
      }),
    },
  }

  const result = doPost(testData)
  console.log(result.getContent())
}

// Function to manually sync all data (optional)
function syncAllData() {
  // This function can be called manually or set up as a trigger
  // to periodically sync data from your Recon Tracker system
  console.log("Manual sync triggered")
}

/**
 * This Google Apps Script is designed to be deployed as a web app
 * to allow external services (like your Next.js app) to read data from a Google Sheet.
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
 */
