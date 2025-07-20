"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Smartphone,
  TestTube,
  Loader2,
  AlertTriangle,
  Database,
  BarChart3,
  Clock,
  Code,
  Settings,
  Play,
} from "lucide-react"
import { toast } from "sonner"

interface ConnectionTestResult {
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
}

export default function IntegrationsPage() {
  const [testResult, setTestResult] = useState<ConnectionTestResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const sheetUrl =
    "https://docs.google.com/spreadsheets/d/14j1_oaNpOepxF1unEA6NJdKqmCeEOj-sbCum57qD8PI/edit?usp=sharing"

  useEffect(() => {
    // Auto-test connection on page load
    testGoogleSheetsConnection()
  }, [])

  const testGoogleSheetsConnection = async () => {
    setIsLoading(true)
    try {
      toast.info("🔄 Testing your vAuto Google Sheets connection...")

      const response = await fetch("/api/google-sheets?test=true")
      const data = await response.json()

      const result: ConnectionTestResult = {
        success: data.success || false,
        message: data.message || data.error || "Unknown error",
        vehicleCount: data.count || data.vehicleCount || 0,
        responseTime: data.responseTime || 0,
        timestamp: data.timestamp || new Date().toISOString(),
        sheetUrl,
        integration: data.integration || "vAuto via Google Apps Script",
        sampleData: data.data?.slice(0, 5) || [],
        analysis: data.analysis,
        error: data.error,
      }

      setTestResult(result)

      if (result.success) {
        toast.success(
          `✅ vAuto integration connected! Found ${result.vehicleCount} vehicles in ${result.responseTime}ms`,
          {
            duration: 5000,
          },
        )
      } else {
        toast.error(`❌ Connection failed: ${result.message}`, { duration: 8000 })
      }
    } catch (error) {
      console.error("Connection test error:", error)
      setTestResult({
        success: false,
        message: "Network error occurred",
        error: error instanceof Error ? error.message : "Unknown error",
        vehicleCount: 0,
        responseTime: 0,
        timestamp: new Date().toISOString(),
        sheetUrl: sheetUrl,
        integration: "vAuto via Google Apps Script",
      })
      toast.error("❌ Network error during connection test")
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (success: boolean | undefined) => {
    if (isLoading) return <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
    if (success) return <CheckCircle className="h-4 w-4 text-green-600" />
    if (success === false) return <AlertTriangle className="h-4 w-4 text-red-600" />
    return <AlertCircle className="h-4 w-4 text-gray-400" />
  }

  const getStatusText = (success: boolean | undefined) => {
    if (isLoading) return "Testing..."
    if (success) return "Connected"
    if (success === false) return "Error"
    return "Unknown"
  }

  const getStatusColor = (success: boolean | undefined) => {
    if (isLoading) return "bg-blue-100 text-blue-800"
    if (success) return "bg-green-100 text-green-800"
    if (success === false) return "bg-red-100 text-red-800"
    return "bg-gray-100 text-gray-800"
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">vAuto Integration</h1>
          <p className="text-muted-foreground">Your vAuto inventory connected via Google Sheets</p>
        </div>
        <Button asChild>
          <a href="/integrations/test">
            <Play className="h-4 w-4 mr-2" />
            Detailed Test
          </a>
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="connection">Connection</TabsTrigger>
          <TabsTrigger value="mobile-setup">Mobile Setup</TabsTrigger>
          <TabsTrigger value="data-analysis">Data Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-blue-600" />
                  vAuto Integration Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(testResult?.success)}
                    <span className="text-sm font-medium">{getStatusText(testResult?.success)}</span>
                  </div>
                  <Badge className={getStatusColor(testResult?.success)}>
                    {testResult?.success && testResult.vehicleCount > 0
                      ? `${testResult.vehicleCount} vehicles`
                      : getStatusText(testResult?.success)}
                  </Badge>
                </div>

                {testResult && (
                  <div className="text-xs text-gray-500 space-y-1">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      <span>Response time: {testResult.responseTime}ms</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Code className="h-3 w-3" />
                      <span>{testResult.integration}</span>
                    </div>
                    <p>Last tested: {new Date(testResult.timestamp).toLocaleString()}</p>
                  </div>
                )}

                <p className="text-sm text-gray-600">
                  {testResult?.success
                    ? "Your vAuto inventory is successfully connected via Google Sheets"
                    : "Connect your vAuto inventory feed through Google Sheets automation"}
                </p>

                <div className="flex gap-2">
                  <Button size="sm" onClick={testGoogleSheetsConnection} disabled={isLoading}>
                    {isLoading ? (
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    ) : (
                      <TestTube className="h-3 w-3 mr-1" />
                    )}
                    Test Connection
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => window.open(sheetUrl, "_blank")}>
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Open Sheet
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-green-600" />
                  Mobile Dashboard
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Ready</span>
                  </div>
                  <Badge variant="secondary">Live Data</Badge>
                </div>

                <p className="text-sm text-gray-600">
                  Mobile dashboard is ready for your team with real-time vAuto data sync
                </p>

                <div className="flex gap-2">
                  <Button size="sm" asChild>
                    <a href="/mobile" target="_blank" rel="noopener noreferrer">
                      <Smartphone className="h-3 w-3 mr-1" />
                      Open Mobile
                    </a>
                  </Button>
                  <Button size="sm" variant="outline" asChild>
                    <a href="/integrations/test">
                      <TestTube className="h-3 w-3 mr-1" />
                      Run Test
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Connection Status Alerts */}
          {testResult?.success === false && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>vAuto Integration Issue:</strong> {testResult.message}
                <br />
                <br />
                <strong>Troubleshooting Steps:</strong>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Make sure your Google Sheet is shared publicly (Anyone with the link can view)</li>
                  <li>Verify the "Shop Tracker" tab exists with vehicle data</li>
                  <li>Run your Google Apps Script to update the Shop Tracker from vAuto Feed</li>
                  <li>Check that both "vAuto Feed" and "Shop Tracker" tabs are present</li>
                </ul>
                <div className="mt-3">
                  <Button size="sm" asChild>
                    <a href="/integrations/test">
                      <TestTube className="h-3 w-3 mr-1" />
                      Run Detailed Test
                    </a>
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {testResult?.success && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>✅ vAuto Integration Active!</strong>
                <br />
                Connected to {testResult.vehicleCount} vehicles in {testResult.responseTime}ms via{" "}
                {testResult.integration}
                {testResult.analysis && (
                  <>
                    <br />📊 Status: {testResult.analysis.throughShop} in shop, {testResult.analysis.detailComplete}{" "}
                    completed, {testResult.analysis.overdue} overdue
                    <br />📈 Average days in inventory: {testResult.analysis.avgDaysInInventory} days
                  </>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Live Data Preview */}
          {testResult?.success && testResult.sampleData && testResult.sampleData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Live vAuto Data Preview
                  </div>
                  <Badge variant="outline">{testResult.vehicleCount} total vehicles</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {testResult.sampleData.slice(0, 5).map((vehicle: any, index: number) => (
                    <div key={index} className="flex items-center justify-between py-3 border-b last:border-b-0">
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {vehicle.year} {vehicle.make} {vehicle.model}
                        </p>
                        <p className="text-xs text-gray-500">
                          Stock: {vehicle.stock} • {vehicle.daysInInventory} days in inventory
                        </p>
                        {vehicle.inventoryDate && (
                          <p className="text-xs text-gray-400">Inventory: {vehicle.inventoryDate}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Badge variant={vehicle.throughShop ? "default" : "secondary"} className="text-xs">
                          Shop: {vehicle.throughShop ? "✓" : "○"}
                        </Badge>
                        <Badge variant={vehicle.detailComplete ? "default" : "secondary"} className="text-xs">
                          Detail: {vehicle.detailComplete ? "✓" : "○"}
                        </Badge>
                        {vehicle.daysInInventory > 7 && !vehicle.throughShop && (
                          <Badge variant="destructive" className="text-xs">
                            Overdue
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                  {testResult.vehicleCount > 5 && (
                    <p className="text-xs text-gray-500 text-center pt-2">
                      And {testResult.vehicleCount - 5} more vehicles from your vAuto feed...
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="connection" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Your vAuto Google Sheet Connection
                <Badge className={getStatusColor(testResult?.success)}>{getStatusText(testResult?.success)}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Google Sheets URL</label>
                <div className="flex gap-2">
                  <input value={sheetUrl} readOnly className="flex-1 bg-gray-50 text-xs p-2 border rounded" />
                  <Button variant="outline" size="icon" onClick={() => window.open(sheetUrl, "_blank")}>
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Connection Test</label>
                <div className="flex gap-2">
                  <Button onClick={testGoogleSheetsConnection} disabled={isLoading} className="flex-1" size="lg">
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <TestTube className="h-4 w-4 mr-2" />
                    )}
                    {isLoading ? "Testing vAuto Connection..." : "Test vAuto Integration"}
                  </Button>
                  <Button variant="outline" asChild>
                    <a href="/integrations/test">
                      <Settings className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>

              \
