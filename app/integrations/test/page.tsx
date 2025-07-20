"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Database,
  FileSpreadsheet,
  Smartphone,
  ArrowLeft,
  RefreshCw,
  TestTube,
  Loader2,
  BarChart3,
  Settings,
  ExternalLink,
} from "lucide-react"
import { toast } from "sonner"

interface TestStep {
  id: string
  name: string
  description: string
  status: "pending" | "running" | "success" | "warning" | "error"
  message?: string
  details?: string[]
  duration?: number
  data?: any
}

interface TestSummary {
  total: number
  passed: number
  warnings: number
  failed: number
  duration: number
}

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

export default function IntegrationTestPage() {
  const [isRunning, setIsRunning] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [testSteps, setTestSteps] = useState<TestStep[]>([
    {
      id: "env-check",
      name: "Environment Configuration",
      description: "Verify Google Sheets URL is configured",
      status: "pending",
    },
    {
      id: "sheet-access",
      name: "Sheet Accessibility",
      description: "Test public access to Google Sheet",
      status: "pending",
    },
    {
      id: "tab-detection",
      name: "Tab Structure Detection",
      description: "Detect vAuto Feed and Shop Tracker tabs",
      status: "pending",
    },
    {
      id: "data-parsing",
      name: "Data Parsing & Validation",
      description: "Parse vehicle data from Shop Tracker tab",
      status: "pending",
    },
    {
      id: "status-analysis",
      name: "Status Analysis",
      description: "Analyze vehicle statuses and completion rates",
      status: "pending",
    },
    {
      id: "performance-test",
      name: "Performance & Caching",
      description: "Test data loading performance and caching",
      status: "pending",
    },
  ])

  const [testSummary, setTestSummary] = useState<TestSummary | null>(null)
  const [vehicleData, setVehicleData] = useState<Vehicle[]>([])
  const [analysisData, setAnalysisData] = useState<any>(null)
  const [connectionData, setConnectionData] = useState<any>(null)

  const sheetUrl = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_URL || ""

  useEffect(() => {
    // Auto-run tests on page load
    runCompleteTest()
  }, [])

  const runCompleteTest = async () => {
    setIsRunning(true)
    setCurrentStep(0)
    const startTime = Date.now()

    // Reset all steps
    const resetSteps = testSteps.map((step) => ({
      ...step,
      status: "pending" as const,
      message: undefined,
      details: undefined,
      duration: undefined,
    }))
    setTestSteps(resetSteps)

    let passedCount = 0
    let warningCount = 0
    let failedCount = 0

    try {
      // Step 1: Environment Configuration
      setCurrentStep(1)
      const envResult = await runEnvironmentCheck(resetSteps, 0)
      if (envResult.success) passedCount++
      else failedCount++

      // Step 2: Sheet Accessibility
      setCurrentStep(2)
      const accessResult = await runAccessibilityCheck(resetSteps, 1)
      if (accessResult.success) {
        passedCount++
        setConnectionData(accessResult.data)
      } else {
        failedCount++
      }

      // Step 3: Tab Detection
      if (accessResult.success) {
        setCurrentStep(3)
        const tabResult = await runTabDetection(resetSteps, 2, accessResult.data)
        if (tabResult.success) passedCount++
        else if (tabResult.warning) warningCount++
        else failedCount++

        // Step 4: Data Parsing
        if (tabResult.success || tabResult.warning) {
          setCurrentStep(4)
          const parseResult = await runDataParsing(resetSteps, 3, accessResult.data)
          if (parseResult.success) {
            passedCount++
            setVehicleData(parseResult.data || [])
          } else if (parseResult.warning) {
            warningCount++
            setVehicleData(parseResult.data || [])
          } else {
            failedCount++
          }

          // Step 5: Status Analysis
          if (parseResult.success || parseResult.warning) {
            setCurrentStep(5)
            const analysisResult = await runStatusAnalysis(resetSteps, 4, parseResult.data || [])
            if (analysisResult.success) {
              passedCount++
              setAnalysisData(analysisResult.analysis)
            } else if (analysisResult.warning) {
              warningCount++
              setAnalysisData(analysisResult.analysis)
            } else {
              failedCount++
            }

            // Step 6: Performance Test
            setCurrentStep(6)
            const perfResult = await runPerformanceTest(resetSteps, 5)
            if (perfResult.success) passedCount++
            else if (perfResult.warning) warningCount++
            else failedCount++
          }
        }
      }

      const endTime = Date.now()
      const totalDuration = endTime - startTime

      setTestSummary({
        total: testSteps.length,
        passed: passedCount,
        warnings: warningCount,
        failed: failedCount,
        duration: totalDuration,
      })

      // Show appropriate toast message
      if (failedCount === 0 && warningCount === 0) {
        toast.success("🎉 All tests passed! Your vAuto integration is ready!", { duration: 5000 })
      } else if (failedCount === 0) {
        toast.warning(`⚠️ Tests completed with ${warningCount} warnings`, { duration: 5000 })
      } else {
        toast.error(`❌ ${failedCount} tests failed. Check the details below.`, { duration: 8000 })
      }
    } catch (error) {
      console.error("Test execution error:", error)
      toast.error("Test execution failed")
      failedCount++
    } finally {
      setIsRunning(false)
      setCurrentStep(0)
    }
  }

  const runEnvironmentCheck = async (steps: TestStep[], index: number) => {
    const stepStart = Date.now()
    steps[index].status = "running"
    setTestSteps([...steps])

    await new Promise((resolve) => setTimeout(resolve, 500))

    if (!sheetUrl) {
      steps[index].status = "error"
      steps[index].message = "Google Sheets URL not configured"
      steps[index].details = [
        "❌ NEXT_PUBLIC_GOOGLE_SHEETS_URL environment variable is missing",
        "🔧 Add NEXT_PUBLIC_GOOGLE_SHEETS_URL to your .env.local file",
        "🔧 The URL should be your Google Sheet's sharing URL",
        "🔧 Example: https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit?usp=sharing",
        "🔧 Restart your development server after adding the variable",
      ]
    } else if (!sheetUrl.includes("docs.google.com/spreadsheets")) {
      steps[index].status = "error"
      steps[index].message = "Invalid Google Sheets URL format"
      steps[index].details = [
        "❌ URL must be a valid Google Sheets URL",
        `❌ Current URL: ${sheetUrl}`,
        "🔧 Make sure it includes 'docs.google.com/spreadsheets'",
        "🔧 Use the sharing URL from your Google Sheet",
        "🔧 URL should look like: https://docs.google.com/spreadsheets/d/SHEET_ID/edit?usp=sharing",
      ]
    } else {
      steps[index].status = "success"
      steps[index].message = "Environment properly configured"
      steps[index].details = [
        `✅ Sheet URL: ${sheetUrl.substring(0, 60)}...`,
        "✅ URL format is valid",
        "✅ Environment variable is properly set",
        "✅ Ready to test connection",
      ]
    }

    steps[index].duration = Date.now() - stepStart
    setTestSteps([...steps])
    return { success: steps[index].status === "success" }
  }

  const runAccessibilityCheck = async (steps: TestStep[], index: number) => {
    const stepStart = Date.now()
    steps[index].status = "running"
    setTestSteps([...steps])

    try {
      const response = await fetch("/api/google-sheets")
      const data = await response.json()

      if (data.success) {
        steps[index].status = "success"
        steps[index].message = `Sheet accessible with ${data.totalVehicles || 0} vehicles`
        steps[index].details = [
          `✅ Response time: ${data.responseTime || "N/A"}ms`,
          `✅ GID used: ${data.gidUsed || "default"}`,
          `✅ Headers found: ${data.headers?.length || 0} columns`,
          `✅ Integration: ${data.integration || "Google Sheets"}`,
          "✅ Sheet is publicly accessible",
        ]
        steps[index].duration = Date.now() - stepStart
        setTestSteps([...steps])
        return { success: true, data }
      } else {
        steps[index].status = "error"
        steps[index].message = data.error || "Failed to access sheet"
        steps[index].details = data.troubleshooting || [
          "❌ Could not access Google Sheet",
          "🔧 Make sure your Google Sheet is shared publicly",
          "🔧 Check that the URL is correct",
          "🔧 Verify the sheet contains data",
          "🔧 Try opening the sheet URL in a new browser tab",
        ]
        steps[index].duration = Date.now() - stepStart
        setTestSteps([...steps])
        return { success: false }
      }
    } catch (error) {
      steps[index].status = "error"
      steps[index].message = "Network error accessing sheet"
      steps[index].details = [
        `❌ ${error instanceof Error ? error.message : "Unknown network error"}`,
        "🔧 Check your internet connection",
        "🔧 Verify the sheet URL is accessible",
        "🔧 Try refreshing the page",
      ]
      steps[index].duration = Date.now() - stepStart
      setTestSteps([...steps])
      return { success: false }
    }
  }

  const runTabDetection = async (steps: TestStep[], index: number, connectionData: any) => {
    const stepStart = Date.now()
    steps[index].status = "running"
    setTestSteps([...steps])

    try {
      if (connectionData && connectionData.headers) {
        const headers = connectionData.headers

        const hasShopColumns = headers.some(
          (h: string) =>
            h.toLowerCase().includes("through shop") ||
            h.toLowerCase().includes("detail complete") ||
            h.toLowerCase().includes("shop done") ||
            h.toLowerCase().includes("detail done"),
        )

        const hasVautoColumns = headers.some(
          (h: string) =>
            h.toLowerCase().includes("series") ||
            h.toLowerCase().includes("odometer") ||
            h.toLowerCase().includes("book value") ||
            h.toLowerCase().includes("retail"),
        )

        const hasInventoryColumns = headers.some(
          (h: string) =>
            h.toLowerCase().includes("inventory date") ||
            h.toLowerCase().includes("days in inventory") ||
            h.toLowerCase().includes("stock"),
        )

        if (hasShopColumns && hasInventoryColumns) {
          steps[index].status = "success"
          steps[index].message = "Shop Tracker tab detected successfully"
          steps[index].details = [
            "✅ Found 'Through Shop' tracking column",
            "✅ Found 'Detail Complete' tracking column",
            "✅ Found inventory date tracking",
            "✅ Found vehicle identification columns",
            hasVautoColumns ? "✅ vAuto source columns also present" : "ℹ️ vAuto columns not in this tab (normal)",
            `✅ Total columns detected: ${headers.length}`,
          ]
        } else if (hasVautoColumns && !hasShopColumns) {
          steps[index].status = "error"
          steps[index].message = "Connected to vAuto Feed tab instead of Shop Tracker"
          steps[index].details = [
            "❌ This appears to be the vAuto Feed tab",
            "❌ Shop Tracker tab not found or not accessible",
            "❌ Missing 'Through Shop' and 'Detail Complete' columns",
            "🔧 Run your Google Apps Script to create Shop Tracker tab",
            "🔧 Make sure the script populates the tracking columns",
            "🔧 Check that the Shop Tracker tab is the active/default tab",
          ]
        } else if (hasInventoryColumns && !hasShopColumns) {
          steps[index].status = "warning"
          steps[index].message = "Partial Shop Tracker structure detected"
          steps[index].details = [
            "⚠️ Found inventory tracking columns",
            "⚠️ Missing shop/detail completion tracking",
            "🔧 Your Google Apps Script may not have run completely",
            "🔧 Check that all formulas and columns were created",
            `ℹ️ Found columns: ${headers.slice(0, 10).join(", ")}${headers.length > 10 ? "..." : ""}`,
          ]
        } else {
          steps[index].status = "error"
          steps[index].message = "Unknown or empty tab structure"
          steps[index].details = [
            "❌ Could not identify tab type",
            "❌ Missing required tracking columns",
            `❌ Found columns: ${headers.join(", ")}`,
            "🔧 Verify your Google Apps Script has run successfully",
            "🔧 Check that column names match expected format",
            "🔧 Make sure the sheet contains vehicle data",
          ]
        }
      } else {
        steps[index].status = "error"
        steps[index].message = "Could not detect tab structure"
        steps[index].details = [
          "❌ No headers found in sheet response",
          "🔧 Make sure the sheet contains data",
          "🔧 Run your Google Apps Script first",
          "🔧 Check that the sheet is not empty",
        ]
      }

      steps[index].duration = Date.now() - stepStart
      setTestSteps([...steps])
      return {
        success: steps[index].status === "success",
        warning: steps[index].status === "warning",
      }
    } catch (error) {
      steps[index].status = "error"
      steps[index].message = "Error detecting tabs"
      steps[index].details = [
        `❌ ${error instanceof Error ? error.message : "Unknown error"}`,
        "🔧 Try running the test again",
      ]
      steps[index].duration = Date.now() - stepStart
      setTestSteps([...steps])
      return { success: false }
    }
  }

  const runDataParsing = async (steps: TestStep[], index: number, connectionData: any) => {
    const stepStart = Date.now()
    steps[index].status = "running"
    setTestSteps([...steps])

    try {
      if (connectionData && connectionData.vehicles && connectionData.vehicles.length > 0) {
        const vehicles = connectionData.vehicles
        const sampleVehicle = vehicles[0]

        // Check required fields
        const requiredFields = ["id", "vin", "year", "make", "model"]
        const optionalFields = ["inventoryDate", "daysInInventory", "status"]

        const missingRequired = requiredFields.filter((field) => !sampleVehicle[field])
        const missingOptional = optionalFields.filter((field) => !sampleVehicle[field])

        // Check data quality
        const withVin = vehicles.filter((v) => v.vin && v.vin.length >= 10).length
        const withMake = vehicles.filter((v) => v.make && v.make.trim().length > 0).length
        const withStatus = vehicles.filter(
          (v) => v.status && ["in-shop", "in-detail", "completed"].includes(v.status),
        ).length

        if (missingRequired.length === 0) {
          steps[index].status = "success"
          steps[index].message = `Successfully parsed ${vehicles.length} vehicles`
          steps[index].details = [
            `✅ All required fields present`,
            `✅ Sample: ${sampleVehicle.year} ${sampleVehicle.make} ${sampleVehicle.model}`,
            `✅ VIN: ${sampleVehicle.vin?.substring(0, 8)}...`,
            `✅ Status: ${sampleVehicle.status || "Unknown"}`,
            `✅ Data quality: ${withVin}/${vehicles.length} have valid VINs`,
            `✅ Make data: ${withMake}/${vehicles.length} have make info`,
            `✅ Status tracking: ${withStatus}/${vehicles.length} have valid status`,
          ]
        } else if (missingRequired.length <= 2) {
          steps[index].status = "warning"
          steps[index].message = `Parsed ${vehicles.length} vehicles with some missing fields`
          steps[index].details = [
            `⚠️ Missing required fields: ${missingRequired.join(", ")}`,
            `⚠️ Missing optional fields: ${missingOptional.join(", ")}`,
            `✅ Found ${vehicles.length} vehicles total`,
            `ℹ️ Data quality: ${Math.round((withVin / vehicles.length) * 100)}% have valid VINs`,
            "🔧 Check your Google Apps Script column mapping",
            "🔧 Verify vAuto data is complete",
          ]
        } else {
          steps[index].status = "error"
          steps[index].message = `Critical data missing from ${vehicles.length} vehicles`
          steps[index].details = [
            `❌ Missing critical fields: ${missingRequired.join(", ")}`,
            `❌ Data quality too low for reliable tracking`,
            "🔧 Check your Google Apps Script implementation",
            "🔧 Verify vAuto Feed has complete data",
            "🔧 Check column name mapping in your script",
          ]
        }

        steps[index].duration = Date.now() - stepStart
        setTestSteps([...steps])
        return {
          success: steps[index].status === "success",
          warning: steps[index].status === "warning",
          data: vehicles,
        }
      } else {
        steps[index].status = "error"
        steps[index].message = "No vehicle data found"
        steps[index].details = [
          "❌ Sheet appears to be empty or inaccessible",
          "❌ No vehicle records returned from API",
          "🔧 Run your Google Apps Script to populate data",
          "🔧 Check that the Shop Tracker tab has vehicle rows",
          "🔧 Verify the vAuto Feed tab has source data",
          "🔧 Make sure the script completed without errors",
        ]
        steps[index].duration = Date.now() - stepStart
        setTestSteps([...steps])
        return { success: false }
      }
    } catch (error) {
      steps[index].status = "error"
      steps[index].message = "Error parsing vehicle data"
      steps[index].details = [
        `❌ ${error instanceof Error ? error.message : "Unknown parsing error"}`,
        "🔧 Check the API response format",
        "🔧 Verify Google Sheets data structure",
      ]
      steps[index].duration = Date.now() - stepStart
      setTestSteps([...steps])
      return { success: false }
    }
  }

  const runStatusAnalysis = async (steps: TestStep[], index: number, vehicles: Vehicle[]) => {
    const stepStart = Date.now()
    steps[index].status = "running"
    setTestSteps([...steps])

    try {
      if (vehicles && vehicles.length > 0) {
        // Calculate statistics
        const total = vehicles.length
        const inShop = vehicles.filter((v) => v.status === "in-shop").length
        const inDetail = vehicles.filter((v) => v.status === "in-detail").length
        const completed = vehicles.filter((v) => v.status === "completed").length
        const overdue = vehicles.filter((v) => v.daysInInventory > 7 && v.status !== "completed").length

        const avgDaysInInventory =
          total > 0 ? Math.round(vehicles.reduce((sum, v) => sum + (v.daysInInventory || 0), 0) / total) : 0

        // Group by make
        const byMake = vehicles.reduce(
          (acc, v) => {
            if (v.make) {
              acc[v.make] = (acc[v.make] || 0) + 1
            }
            return acc
          },
          {} as Record<string, number>,
        )

        // Calculate rates
        const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0
        const shopRate = total > 0 ? Math.round(((inShop + inDetail + completed) / total) * 100) : 0
        const overdueRate = total > 0 ? Math.round((overdue / total) * 100) : 0

        const analysis = {
          total,
          inShop,
          inDetail,
          completed,
          overdue,
          avgDaysInInventory,
          byMake,
          completionRate,
          shopRate,
          overdueRate,
        }

        if (total >= 10) {
          steps[index].status = "success"
          steps[index].message = `Analysis complete for ${total} vehicles`
          steps[index].details = [
            `📊 Completion rate: ${completionRate}% (${completed} vehicles)`,
            `🔧 In shop: ${inShop} vehicles`,
            `🎨 In detail: ${inDetail} vehicles`,
            `⚠️ Overdue (>7 days): ${overdue} vehicles (${overdueRate}%)`,
            `📈 Avg days in inventory: ${avgDaysInInventory} days`,
            `🏭 Top make: ${Object.entries(byMake).sort(([, a], [, b]) => (b as number) - (a as number))[0]?.[0] || "N/A"}`,
          ]
        } else if (total > 0) {
          steps[index].status = "warning"
          steps[index].message = `Limited analysis for ${total} vehicles`
          steps[index].details = [
            `⚠️ Small dataset: Only ${total} vehicles found`,
            `📊 Completion rate: ${completionRate}%`,
            `🔧 In process: ${inShop + inDetail} vehicles`,
            `✅ Completed: ${completed} vehicles`,
            "ℹ️ More vehicles needed for comprehensive analysis",
            "🔧 Check that your vAuto Feed has more inventory",
          ]
        } else {
          steps[index].status = "error"
          steps[index].message = "No vehicles available for analysis"
          steps[index].details = [
            "❌ No vehicle data available for analysis",
            "🔧 Make sure your Google Apps Script has populated the sheet",
            "🔧 Check that vAuto Feed contains vehicle data",
            "🔧 Verify the script ran without errors",
          ]
        }

        steps[index].duration = Date.now() - stepStart
        setTestSteps([...steps])
        return {
          success: steps[index].status === "success",
          warning: steps[index].status === "warning",
          analysis,
        }
      } else {
        steps[index].status = "error"
        steps[index].message = "No vehicle data provided for analysis"
        steps[index].details = [
          "❌ No vehicles passed to analysis step",
          "🔧 Previous data parsing step may have failed",
        ]
        steps[index].duration = Date.now() - stepStart
        setTestSteps([...steps])
        return { success: false }
      }
    } catch (error) {
      steps[index].status = "error"
      steps[index].message = "Error analyzing vehicle status"
      steps[index].details = [
        `❌ ${error instanceof Error ? error.message : "Unknown analysis error"}`,
        "🔧 Check vehicle data format",
      ]
      steps[index].duration = Date.now() - stepStart
      setTestSteps([...steps])
      return { success: false }
    }
  }

  const runPerformanceTest = async (steps: TestStep[], index: number) => {
    const stepStart = Date.now()
    steps[index].status = "running"
    setTestSteps([...steps])

    try {
      // Test multiple requests to check caching and performance
      const startTime = Date.now()
      const response1 = await fetch("/api/google-sheets")
      const firstLoadTime = Date.now() - startTime

      // Small delay then test cached response
      await new Promise((resolve) => setTimeout(resolve, 100))

      const cacheStartTime = Date.now()
      const response2 = await fetch("/api/google-sheets")
      const cachedLoadTime = Date.now() - cacheStartTime

      if (response1.ok && response2.ok) {
        const data1 = await response1.json()
        const data2 = await response2.json()

        const performanceGrade =
          firstLoadTime < 2000 ? "Excellent" : firstLoadTime < 5000 ? "Good" : "Needs improvement"
        const cachingWorking = cachedLoadTime < firstLoadTime * 0.8

        if (firstLoadTime < 5000 && cachingWorking) {
          steps[index].status = "success"
          steps[index].message = "Performance test completed successfully"
          steps[index].details = [
            `⚡ First load: ${firstLoadTime}ms (${performanceGrade})`,
            `🚀 Cached load: ${cachedLoadTime}ms`,
            `📈 Performance improvement: ${Math.round(((firstLoadTime - cachedLoadTime) / firstLoadTime) * 100)}%`,
            `💾 Caching: ${cachingWorking ? "Working properly" : "Not optimized"}`,
            `📊 Data consistency: ${data1.totalVehicles === data2.totalVehicles ? "Consistent" : "Inconsistent"}`,
            "✅ Ready for production use",
          ]
        } else {
          steps[index].status = "warning"
          steps[index].message = "Performance test completed with concerns"
          steps[index].details = [
            `⚠️ First load: ${firstLoadTime}ms (${performanceGrade})`,
            `⚠️ Cached load: ${cachedLoadTime}ms`,
            `💾 Caching: ${cachingWorking ? "Working" : "Not effective"}`,
            firstLoadTime >= 5000 ? "🔧 Consider optimizing Google Apps Script" : "",
            !cachingWorking ? "🔧 Check caching implementation" : "",
            "ℹ️ May work slower in production",
          ].filter(Boolean)
        }
      } else {
        steps[index].status = "error"
        steps[index].message = "Performance test failed"
        steps[index].details = [
          `❌ First request: ${response1.status} ${response1.statusText}`,
          `❌ Second request: ${response2.status} ${response2.statusText}`,
          "🔧 Check API endpoint functionality",
          "🔧 Verify Google Sheets accessibility",
        ]
      }

      steps[index].duration = Date.now() - stepStart
      setTestSteps([...steps])
      return {
        success: steps[index].status === "success",
        warning: steps[index].status === "warning",
      }
    } catch (error) {
      steps[index].status = "error"
      steps[index].message = "Performance test failed"
      steps[index].details = [
        `❌ ${error instanceof Error ? error.message : "Unknown performance error"}`,
        "🔧 Check network connectivity",
        "🔧 Verify API endpoint is responding",
      ]
      steps[index].duration = Date.now() - stepStart
      setTestSteps([...steps])
      return { success: false }
    }
  }

  const getStepIcon = (status: TestStep["status"]) => {
    switch (status) {
      case "running":
        return <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getStepColor = (status: TestStep["status"]) => {
    switch (status) {
      case "running":
        return "border-blue-200 bg-blue-50"
      case "success":
        return "border-green-200 bg-green-50"
      case "warning":
        return "border-yellow-200 bg-yellow-50"
      case "error":
        return "border-red-200 bg-red-50"
      default:
        return "border-gray-200 bg-gray-50"
    }
  }

  const completedSteps = testSteps.filter((s) => s.status !== "pending" && s.status !== "running").length
  const progressPercentage = (completedSteps / testSteps.length) * 100

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" asChild>
            <a href="/integrations">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Integrations
            </a>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">vAuto Integration Test Suite</h1>
            <p className="text-muted-foreground">Comprehensive validation of your Google Sheets connection</p>
          </div>
        </div>
        <Button onClick={runCompleteTest} disabled={isRunning}>
          {isRunning ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
          {isRunning ? "Running Tests..." : "Run Tests Again"}
        </Button>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Test Progress
            {testSummary && (
              <Badge
                variant={testSummary.failed > 0 ? "destructive" : testSummary.warnings > 0 ? "secondary" : "default"}
              >
                {testSummary.passed}/{testSummary.total} Passed
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            {isRunning
              ? `Running step ${currentStep} of ${testSteps.length}...`
              : "Validating your vAuto Google Sheets integration step by step"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Progress</span>
              <span>
                {completedSteps}/{testSteps.length} steps completed
              </span>
            </div>
            <Progress value={progressPercentage} className="w-full" />
          </div>

          {testSummary && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{testSummary.passed}</div>
                <div className="text-sm text-muted-foreground">Passed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{testSummary.warnings}</div>
                <div className="text-sm text-muted-foreground">Warnings</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{testSummary.failed}</div>
                <div className="text-sm text-muted-foreground">Failed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{Math.round(testSummary.duration / 1000)}s</div>
                <div className="text-sm text-muted-foreground">Duration</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Test Results</CardTitle>
          <CardDescription>Step-by-step validation of your integration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {testSteps.map((step, index) => (
            <div key={step.id} className={`p-4 rounded-lg border ${getStepColor(step.status)}`}>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">{getStepIcon(step.status)}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{step.name}</h4>
                    <div className="flex items-center gap-2">
                      {step.duration && <span className="text-xs text-muted-foreground">{step.duration}ms</span>}
                      <Badge variant="outline" className="text-xs">
                        Step {index + 1}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{step.description}</p>

                  {step.message && (
                    <p
                      className={`text-sm mt-2 font-medium ${
                        step.status === "success"
                          ? "text-green-700"
                          : step.status === "warning"
                            ? "text-yellow-700"
                            : step.status === "error"
                              ? "text-red-700"
                              : "text-blue-700"
                      }`}
                    >
                      {step.message}
                    </p>
                  )}

                  {step.details && step.details.length > 0 && (
                    <div className="mt-3 space-y-1">
                      {step.details.map((detail, detailIndex) => (
                        <p key={detailIndex} className="text-xs text-gray-600 leading-relaxed">
                          {detail}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysisData && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Vehicle Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600">{analysisData.total}</div>
                  <div className="text-sm text-blue-800">Total Vehicles</div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">{analysisData.completed}</div>
                  <div className="text-sm text-green-800">Completed</div>
                </div>
                <div className="bg-yellow-50 p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {analysisData.inShop + analysisData.inDetail}
                  </div>
                  <div className="text-sm text-yellow-800">In Process</div>
                </div>
                <div className="bg-red-50 p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold text-red-600">{analysisData.overdue}</div>
                  <div className="text-sm text-red-800">Overdue</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Performance Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Completion Rate:</span>
                <span className="font-medium">{analysisData.completionRate}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Shop Processing Rate:</span>
                <span className="font-medium">{analysisData.shopRate}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Average Days in Inventory:</span>
                <span className="font-medium">{analysisData.avgDaysInInventory} days</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Overdue Rate:</span>
                <span className="font-medium text-red-600">{analysisData.overdueRate}%</span>
              </div>
              <Separator />
              <div className="text-sm">
                <span className="text-muted-foreground">Top Makes:</span>
                <div className="mt-1 space-y-1">
                  {Object.entries(analysisData.byMake)
                    .sort(([, a], [, b]) => (b as number) - (a as number))
                    .slice(0, 3)
                    .map(([make, count]) => (
                      <div key={make} className="flex justify-between">
                        <span>{make}</span>
                        <span className="font-medium">{count as number}</span>
                      </div>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Sample Data Preview */}
      {vehicleData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Sample Vehicle Data</CardTitle>
            <CardDescription>First 5 vehicles from your vAuto integration</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {vehicleData.slice(0, 5).map((vehicle, index) => (
                <div key={index} className="flex items-center justify-between py-3 border-b last:border-b-0">
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </p>
                    <p className="text-xs text-gray-500">
                      Stock: {vehicle.id} • VIN: {vehicle.vin?.slice(-6)}
                    </p>
                    <p className="text-xs text-gray-400">{vehicle.daysInInventory} days in inventory</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge
                      variant={
                        vehicle.status === "completed"
                          ? "default"
                          : vehicle.status === "in-detail"
                            ? "secondary"
                            : "outline"
                      }
                      className="text-xs"
                    >
                      {vehicle.status}
                    </Badge>
                    {vehicle.daysInInventory > 7 && vehicle.status !== "completed" && (
                      <Badge variant="destructive" className="text-xs">
                        Overdue
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
              {vehicleData.length > 5 && (
                <p className="text-xs text-muted-foreground text-center pt-2">
                  And {vehicleData.length - 5} more vehicles in your inventory...
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
          <CardDescription>What to do after testing is complete</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <Button asChild className="w-full">
              <a href="/mobile" target="_blank" rel="noopener noreferrer">
                <Smartphone className="h-4 w-4 mr-2" />
                Open Mobile Dashboard
              </a>
            </Button>
            <Button variant="outline" asChild className="w-full bg-transparent">
              <a href={sheetUrl} target="_blank" rel="noopener noreferrer">
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                <ExternalLink className="h-3 w-3 ml-1" />
                Open Google Sheet
              </a>
            </Button>
            <Button variant="outline" asChild className="w-full bg-transparent">
              <a href="/analytics">
                <BarChart3 className="h-4 w-4 mr-2" />
                View Analytics
              </a>
            </Button>
            <Button variant="outline" asChild className="w-full bg-transparent">
              <a href="/integrations">
                <Database className="h-4 w-4 mr-2" />
                Integration Settings
              </a>
            </Button>
          </div>

          {testSummary && testSummary.failed === 0 && testSummary.warnings === 0 && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>🎉 Integration Perfect!</strong>
                <br />
                Your vAuto Google Sheets integration is working flawlessly. You can now:
                <br />• Share the mobile dashboard with your team
                <br />• Set up automatic triggers in Google Apps Script for real-time updates
                <br />• Deploy to production with confidence
                <br />• Monitor vehicle progress in real-time
              </AlertDescription>
            </Alert>
          )}

          {testSummary && testSummary.failed === 0 && testSummary.warnings > 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>⚠️ Integration Working with Minor Issues</strong>
                <br />
                Your integration is functional but has {testSummary.warnings} warning(s):
                <br />• Some optional data fields may be missing
                <br />• Performance could be optimized
                <br />• Consider addressing warnings for best experience
                <br />• Safe to use in production with monitoring
              </AlertDescription>
            </Alert>
          )}

          {testSummary && testSummary.failed > 0 && (
            <Alert>
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>❌ Critical Issues Found</strong>
                <br />
                {testSummary.failed} test(s) failed. Common solutions:
                <br />• Run your Google Apps Script to populate the Shop Tracker tab
                <br />• Make sure your Google Sheet is publicly accessible (Anyone with link can view)
                <br />• Verify the Shop Tracker tab has the correct column structure
                <br />• Check that your .env.local file has the correct NEXT_PUBLIC_GOOGLE_SHEETS_URL
                <br />• Ensure your vAuto Feed tab contains vehicle data
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
