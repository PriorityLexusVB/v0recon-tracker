"use client"

import { Label } from "@/components/ui/label"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  Loader2,
  Database,
  Code,
  Clock,
  BarChart3,
  TestTube,
  RefreshCw,
  XCircle,
} from "lucide-react"
import { toast } from "sonner"

interface TestResult {
  success: boolean
  message: string
  vehicleCount: number
  responseTime: number
  timestamp: string
  sheetUrl: string
  integration: string
  sampleData?: any[]
  analysis?: {
    totalVehicles: number
    withInventoryDate: number
    throughShop: number
    detailComplete: number
    overdue: number
    avgDaysInInventory: number
    byMake: Record<string, number>
  }
  error?: any
  rawResponse?: any
  troubleshooting?: string[]
}

export default function IntegrationTestPage() {
  const [googleSheetsUrl, setGoogleSheetsUrl] = useState(process.env.NEXT_PUBLIC_GOOGLE_SHEETS_URL || "")
  const [testResult, setTestResult] = useState<TestResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(false)

  const sheetUrl =
    "https://docs.google.com/spreadsheets/d/14j1_oaNpOepxF1unEA6NJdKqmCeEOj-sbCum57qD8PI/edit?usp=sharing"

  useEffect(() => {
    // Auto-test on page load
    runFullTest()
  }, [])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (autoRefresh) {
      interval = setInterval(() => {
        runFullTest()
      }, 30000) // Refresh every 30 seconds
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [autoRefresh])

  const runFullTest = async () => {
    setIsLoading(true)
    try {
      toast.info("🔄 Running comprehensive vAuto integration test...")

      const startTime = Date.now()
      const response = await fetch("/api/google-sheets?test=true&detailed=true")
      const endTime = Date.now()
      const responseTime = endTime - startTime

      const data = await response.json()

      const result: TestResult = {
        success: data.success || false,
        message: data.message || data.error || "Unknown error",
        vehicleCount: data.count || data.vehicleCount || 0,
        responseTime,
        timestamp: new Date().toISOString(),
        sheetUrl,
        integration: data.integration || "vAuto via Google Apps Script",
        sampleData: data.data || [],
        analysis: data.analysis,
        error: data.error,
        rawResponse: data,
        troubleshooting: data.troubleshooting || [],
      }

      setTestResult(result)

      if (result.success) {
        toast.success(
          `✅ vAuto integration test passed! Found ${result.vehicleCount} vehicles in ${result.responseTime}ms`,
          {
            duration: 5000,
          },
        )
      } else {
        toast.error(`❌ Integration test failed: ${result.message}`, { duration: 8000 })
      }
    } catch (error) {
      console.error("Test error:", error)
      setTestResult({
        success: false,
        message: "Network error occurred",
        error: error instanceof Error ? error.message : "Unknown error",
        vehicleCount: 0,
        responseTime: 0,
        timestamp: new Date().toISOString(),
        sheetUrl,
        integration: "vAuto via Google Apps Script",
        troubleshooting: [],
      })
      toast.error("❌ Network error during test")
    } finally {
      setIsLoading(false)
    }
  }

  const handleTestGoogleSheets = async () => {
    setIsLoading(true)
    setTestResult(null)
    try {
      const response = await fetch("/api/google-sheets", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
      const data = await response.json()
      setTestResult(data)
      if (data.success) {
        toast.success("Google Sheets integration test successful!")
      } else {
        toast.error("Google Sheets integration test failed.")
      }
    } catch (error: any) {
      setTestResult({ success: false, error: error.message || "An unexpected error occurred." })
      toast.error("An error occurred during the test.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">vAuto Integration Test</h1>
          <p className="text-muted-foreground">Comprehensive testing of your vAuto Google Sheets connection</p>
        </div>
        <div className="flex gap-2">
          <Button variant={autoRefresh ? "default" : "outline"} size="sm" onClick={() => setAutoRefresh(!autoRefresh)}>
            <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? "animate-spin" : ""}`} />
            Auto Refresh
          </Button>
          <Button onClick={runFullTest} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <TestTube className="h-4 w-4 mr-2" />}
            Run Test
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Google Sheets Integration Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="google-sheets-url">Google Sheets URL (from .env.local)</Label>
            <Input
              id="google-sheets-url"
              value={googleSheetsUrl}
              onChange={(e) => setGoogleSheetsUrl(e.target.value)}
              placeholder="https://docs.google.com/spreadsheets/d/..."
              disabled
            />
            <p className="text-sm text-muted-foreground mt-1">
              This URL is read from your `NEXT_PUBLIC_GOOGLE_SHEETS_URL` environment variable.
            </p>
          </div>
          <Button onClick={handleTestGoogleSheets} disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
            Test Google Sheets Connection
          </Button>

          {testResult && (
            <div className="mt-4 p-4 border rounded-md">
              <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                {testResult.success ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                Test Result: {testResult.success ? "Success" : "Failed"}
              </h3>
              <Textarea value={JSON.stringify(testResult, null, 2)} readOnly rows={10} className="font-mono text-xs" />
              {!testResult.success && testResult.troubleshooting && (
                <div className="mt-4">
                  <h4 className="font-semibold">Troubleshooting Tips:</h4>
                  <ul className="list-disc list-inside text-sm text-muted-foreground">
                    {testResult.troubleshooting.map((tip: string, index: number) => (
                      <li key={index}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test Status Overview */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connection Status</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : testResult?.success ? (
                <CheckCircle className="h-6 w-6 text-green-600" />
              ) : (
                <AlertTriangle className="h-6 w-6 text-red-600" />
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {isLoading ? "Testing..." : testResult?.success ? "Connected" : "Failed"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vehicles Found</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{testResult?.vehicleCount || 0}</div>
            <p className="text-xs text-muted-foreground">From vAuto feed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{testResult?.responseTime || 0}ms</div>
            <p className="text-xs text-muted-foreground">API response</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Integration</CardTitle>
            <Code className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold">Google Apps Script</div>
            <p className="text-xs text-muted-foreground">vAuto → Sheets</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="results" className="space-y-6">
        <TabsList>
          <TabsTrigger value="results">Test Results</TabsTrigger>
          <TabsTrigger value="data">Sample Data</TabsTrigger>
          <TabsTrigger value="analysis">Data Analysis</TabsTrigger>
          <TabsTrigger value="troubleshooting">Troubleshooting</TabsTrigger>
        </TabsList>

        <TabsContent value="results" className="space-y-6">
          {testResult && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Test Results
                  <Badge variant={testResult.success ? "default" : "destructive"}>
                    {testResult.success ? "PASSED" : "FAILED"}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Last run: {new Date(testResult.timestamp).toLocaleString()}
                  {autoRefresh && " (Auto-refreshing every 30s)"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <h4 className="font-medium">Connection Details</h4>
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <span className={testResult.success ? "text-green-600" : "text-red-600"}>
                          {testResult.success ? "✅ Success" : "❌ Failed"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Vehicles:</span>
                        <span className="font-medium">{testResult.vehicleCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Response Time:</span>
                        <span>{testResult.responseTime}ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Integration:</span>
                        <span>{testResult.integration}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Sheet Information</h4>
                    <div className="text-sm space-y-1">
                      <div className="flex items-center gap-2">
                        <span>Sheet URL:</span>
                        <Button variant="outline" size="sm" onClick={() => window.open(testResult.sheetUrl, "_blank")}>
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="flex justify-between">
                        <span>Expected Tab:</span>
                        <span>"Shop Tracker"</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Data Source:</span>
                        <span>"vAuto Feed"</span>
                      </div>
                    </div>
                  </div>
                </div>

                {testResult.message && (
                  <div className="border rounded-lg p-3 bg-gray-50">
                    <h4 className="font-medium mb-1">Message</h4>
                    <p className="text-sm">{testResult.message}</p>
                  </div>
                )}

                {testResult.error && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Error Details:</strong>
                      <pre className="text-xs mt-2 bg-gray-100 p-2 rounded overflow-auto">
                        {JSON.stringify(testResult.error, null, 2)}
                      </pre>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}

          {!testResult && !isLoading && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <TestTube className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Click "Run Test" to start the integration test</p>
                  <Button onClick={runFullTest}>
                    <TestTube className="h-4 w-4 mr-2" />
                    Run Integration Test
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="data" className="space-y-6">
          {testResult?.sampleData && testResult.sampleData.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Sample Vehicle Data</CardTitle>
                <CardDescription>
                  Showing {Math.min(10, testResult.sampleData.length)} of {testResult.vehicleCount} vehicles from your
                  vAuto feed
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {testResult.sampleData.slice(0, 10).map((vehicle: any, index: number) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">
                          {vehicle.year} {vehicle.make} {vehicle.model}
                        </h4>
                        <div className="flex gap-2">
                          <Badge variant={vehicle.throughShop ? "default" : "secondary"}>
                            Shop: {vehicle.throughShop ? "✓" : "○"}
                          </Badge>
                          <Badge variant={vehicle.detailComplete ? "default" : "secondary"}>
                            Detail: {vehicle.detailComplete ? "✓" : "○"}
                          </Badge>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                        <div>
                          <span className="text-gray-600">Stock:</span>
                          <span className="ml-1 font-medium">{vehicle.stock}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">VIN:</span>
                          <span className="ml-1 font-mono text-xs">{vehicle.vin?.slice(-6) || "N/A"}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Days:</span>
                          <span className="ml-1 font-medium">{vehicle.daysInInventory}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Inventory:</span>
                          <span className="ml-1 text-xs">{vehicle.inventoryDate || "N/A"}</span>
                        </div>
                      </div>
                      {vehicle.daysInInventory > 7 && !vehicle.throughShop && (
                        <div className="mt-2">
                          <Badge variant="destructive" className="text-xs">
                            ⚠ Overdue for shop processing
                          </Badge>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No sample data available. Run a test to see vehicle data.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          {testResult?.analysis ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Inventory Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Vehicles</span>
                      <span className="font-semibold">{testResult.analysis.totalVehicles}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">With Inventory Date</span>
                      <span className="font-semibold">{testResult.analysis.withInventoryDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Avg Days in Inventory</span>
                      <span className="font-semibold">{testResult.analysis.avgDaysInInventory} days</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Recon Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Through Shop</span>
                      <span className="font-semibold text-blue-600">{testResult.analysis.throughShop}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Detail Complete</span>
                      <span className="font-semibold text-green-600">{testResult.analysis.detailComplete}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Overdue</span>
                      <span className="font-semibold text-red-600">{testResult.analysis.overdue}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Top Makes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(testResult.analysis.byMake)
                      .sort(([, a], [, b]) => (b as number) - (a as number))
                      .slice(0, 8)
                      .map(([make, count]) => (
                        <div key={make} className="flex justify-between">
                          <span className="text-sm text-gray-600">{make}</span>
                          <span className="font-semibold">{count as number}</span>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Run a test to see data analysis</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="troubleshooting" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Troubleshooting Guide</CardTitle>
              <CardDescription>Common issues and solutions for vAuto integration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2 text-red-600">❌ "Failed to fetch data from Google Sheets"</h4>
                  <ul className="text-sm space-y-1 text-gray-600">
                    <li>• Make sure your Google Sheet is shared publicly (Anyone with the link can view)</li>
                    <li>• Verify the sheet URL is correct and accessible</li>
                    <li>• Check that the "Shop Tracker" tab exists</li>
                  </ul>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2 text-yellow-600">⚠ "No vehicles found" or "0 vehicles"</h4>
                  <ul className="text-sm space-y-1 text-gray-600">
                    <li>• Run your Google Apps Script to populate the "Shop Tracker" tab</li>
                    <li>• Verify the "vAuto Feed" tab has data</li>
                    <li>• Check that column headers match expected format</li>
                    <li>• Ensure data is in the correct format (dates, numbers, etc.)</li>
                  </ul>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2 text-blue-600">ℹ "Slow response times"</h4>
                  <ul className="text-sm space-y-1 text-gray-600">
                    <li>• Large datasets may take longer to process</li>
                    <li>• Consider filtering data in your Google Apps Script</li>
                    <li>• Response times over 5000ms may indicate network issues</li>
                  </ul>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2 text-green-600">✅ Best Practices</h4>
                  <ul className="text-sm space-y-1 text-gray-600">
                    <li>• Run your Google Apps Script regularly (daily or hourly)</li>
                    <li>• Keep the "Shop Tracker" tab updated with latest vAuto data</li>
                    <li>• Monitor the integration test page for any issues</li>
                    <li>• Use the mobile dashboard for real-time updates</li>
                  </ul>
                </div>
              </div>

              <div className="border rounded-lg p-4 bg-blue-50">
                <h4 className="font-medium mb-2">Need Help?</h4>
                <p className="text-sm text-gray-600 mb-3">
                  If you're still experiencing issues, here are some additional resources:
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => window.open(sheetUrl, "_blank")}>
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Open Google Sheet
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <a href="/mobile">View Mobile Dashboard</a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
