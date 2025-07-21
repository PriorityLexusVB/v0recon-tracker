"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
  Plug,
  MessageSquare,
  Mail,
  FileSpreadsheet,
} from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import { ArrowRight } from "lucide-react" // Import ArrowRight

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
    <div className="container mx-auto py-12 px-4 md:px-6">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-50 mb-4">Integrations & API</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          Connect Recon Tracker with your existing tools and workflows to automate data flow, enhance communication, and
          streamline your reconditioning process.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Google Sheets Integration */}
        <Card className="flex flex-col p-6 shadow-lg hover:shadow-xl transition-shadow">
          <FileSpreadsheet className="h-12 w-12 text-green-600 mb-4" />
          <CardTitle className="text-2xl font-semibold mb-2">Google Sheets Sync</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400 mb-4 flex-grow">
            Automatically import vehicle data from your Google Sheets (e.g., vAuto exports) and keep your Recon Tracker
            dashboard up-to-date.
          </CardDescription>
          <Link href="/integrations/google-sheets" passHref>
            <Button variant="outline" className="w-full mt-auto bg-transparent">
              Configure
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </Card>

        {/* SMS Notifications Integration */}
        <Card className="flex flex-col p-6 shadow-lg hover:shadow-xl transition-shadow">
          <MessageSquare className="h-12 w-12 text-blue-600 mb-4" />
          <CardTitle className="text-2xl font-semibold mb-2">SMS Notifications</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400 mb-4 flex-grow">
            Send real-time SMS alerts to team members for critical updates, status changes, and assignments.
          </CardDescription>
          <Link href="/integrations/sms" passHref>
            <Button variant="outline" className="w-full mt-auto bg-transparent">
              Configure
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </Card>

        {/* Email Notifications Integration */}
        <Card className="flex flex-col p-6 shadow-lg hover:shadow-xl transition-shadow">
          <Mail className="h-12 w-12 text-red-600 mb-4" />
          <CardTitle className="text-2xl font-semibold mb-2">Email Notifications</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400 mb-4 flex-grow">
            Set up automated email notifications for various events, daily summaries, and performance reports.
          </CardDescription>
          <Link href="/integrations/email" passHref>
            <Button variant="outline" className="w-full mt-auto bg-transparent">
              Configure
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </Card>

        {/* Webhooks & API Access */}
        <Card className="flex flex-col p-6 shadow-lg hover:shadow-xl transition-shadow">
          <Plug className="h-12 w-12 text-purple-600 mb-4" />
          <CardTitle className="text-2xl font-semibold mb-2">Webhooks & API</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400 mb-4 flex-grow">
            Integrate Recon Tracker with any third-party system using our flexible webhook and REST API. Build custom
            automations and data flows.
          </CardDescription>
          <Link href="/integrations/api-docs" passHref>
            <Button variant="outline" className="w-full mt-auto bg-transparent">
              View API Docs
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </Card>

        {/* Database Direct Access (Advanced) */}
        <Card className="flex flex-col p-6 shadow-lg hover:shadow-xl transition-shadow">
          <Database className="h-12 w-12 text-gray-600 mb-4" />
          <CardTitle className="text-2xl font-semibold mb-2">Database Access</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400 mb-4 flex-grow">
            For advanced users, direct read-only access to your underlying database for complex reporting and data
            warehousing. (Requires Enterprise Plan)
          </CardDescription>
          <Button variant="outline" className="w-full mt-auto bg-transparent" disabled>
            Contact Sales
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Card>

        {/* Custom Integration Development */}
        <Card className="flex flex-col p-6 shadow-lg hover:shadow-xl transition-shadow">
          <Settings className="h-12 w-12 text-orange-600 mb-4" />
          <CardTitle className="text-2xl font-semibold mb-2">Custom Integrations</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400 mb-4 flex-grow">
            Need a specific integration not listed? Our team can work with you to develop custom connectors for your
            unique business needs.
          </CardDescription>
          <Link href="/contact" passHref>
            <Button variant="outline" className="w-full mt-auto bg-transparent">
              Request Custom Integration
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </Card>

        {/* vAuto Integration Overview */}
        <Card className="flex flex-col p-6 shadow-lg hover:shadow-xl transition-shadow">
          <Database className="h-12 w-12 text-blue-600 mb-4" />
          <CardTitle className="text-2xl font-semibold mb-2">vAuto Integration</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400 mb-4 flex-grow">
            Your vAuto inventory connected via Google Sheets
          </CardDescription>
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
              {isLoading ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <TestTube className="h-3 w-3 mr-1" />}
              Test Connection
            </Button>
            <Button size="sm" variant="outline" onClick={() => window.open(sheetUrl, "_blank")}>
              <ExternalLink className="h-3 w-3 mr-1" />
              Open Sheet
            </Button>
          </div>
        </Card>

        {/* Mobile Dashboard Setup */}
        <Card className="flex flex-col p-6 shadow-lg hover:shadow-xl transition-shadow">
          <Smartphone className="h-12 w-12 text-green-600 mb-4" />
          <CardTitle className="text-2xl font-semibold mb-2">Mobile Dashboard Setup</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400 mb-4 flex-grow">
            Get your team started with the mobile interface
          </CardDescription>
          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Step 1: Share the Mobile URL</h4>
              <div className="flex gap-2">
                <input
                  value={`${typeof window !== "undefined" ? window.location.origin : ""}/mobile`}
                  readOnly
                  className="flex-1 bg-gray-50 text-sm p-2 border rounded"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `${typeof window !== "undefined" ? window.location.origin : ""}/mobile`,
                    )
                    toast.success("Mobile URL copied to clipboard!")
                  }}
                >
                  Copy
                </Button>
              </div>
              <p className="text-xs text-gray-600 mt-2">Share this URL with your team members</p>
            </div>

            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Step 2: Bookmark on Mobile Devices</h4>
              <p className="text-sm text-gray-600 mb-2">
                Have team members bookmark the mobile URL on their phones for quick access
              </p>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>• iPhone: Safari → Share → Add to Home Screen</li>
                <li>• Android: Chrome → Menu → Add to Home screen</li>
              </ul>
            </div>

            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Step 3: Test Mobile Access</h4>
              <Button asChild>
                <a href="/mobile" target="_blank" rel="noopener noreferrer">
                  <Smartphone className="h-4 w-4 mr-2" />
                  Open Mobile Dashboard
                </a>
              </Button>
            </div>
          </div>
        </Card>

        {/* Data Analysis */}
        {testResult?.analysis && (
          <Card className="flex flex-col p-6 shadow-lg hover:shadow-xl transition-shadow">
            <BarChart3 className="h-12 w-12 text-gray-600 mb-4" />
            <CardTitle className="text-2xl font-semibold mb-2">Data Analysis</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400 mb-4 flex-grow">
              View detailed analysis of your vehicle inventory data.
            </CardDescription>
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
                      .slice(0, 5)
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
          </Card>
        )}

        {!testResult?.analysis && (
          <Card className="flex flex-col p-6 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="pt-6">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Run a connection test to see data analysis</p>
                <Button className="mt-4" onClick={testGoogleSheetsConnection} disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <TestTube className="h-4 w-4 mr-2" />
                  )}
                  Test vAuto Connection
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
