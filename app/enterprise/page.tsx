"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Building2, Users, Shield, BarChart3, MapPin, Zap, Database, Lock, UserCheck, Activity } from "lucide-react"

interface Location {
  id: string
  name: string
  address: string
  timezone: string
  active: boolean
  vehicleCount: number
  teamCount: number
}

export default function EnterprisePage() {
  const { user, isLoading } = useAuth()
  const [locations, setLocations] = useState<Location[]>([
    {
      id: "loc_1",
      name: "Main Facility",
      address: "123 Auto Way, Detroit, MI",
      timezone: "America/Detroit",
      active: true,
      vehicleCount: 156,
      teamCount: 8,
    },
    {
      id: "loc_2",
      name: "West Coast Center",
      address: "456 Car Blvd, Los Angeles, CA",
      timezone: "America/Los_Angeles",
      active: true,
      vehicleCount: 89,
      teamCount: 5,
    },
    {
      id: "loc_3",
      name: "East Coast Hub",
      address: "789 Vehicle St, Atlanta, GA",
      timezone: "America/New_York",
      active: false,
      vehicleCount: 0,
      teamCount: 0,
    },
  ])

  const [securitySettings, setSecuritySettings] = useState({
    ssoEnabled: false,
    mfaRequired: true,
    sessionTimeout: 480, // minutes
    ipWhitelist: "",
    auditLogging: true,
    dataEncryption: true,
  })

  const [performanceSettings, setPerformanceSettings] = useState({
    cacheEnabled: true,
    compressionEnabled: true,
    cdnEnabled: false,
    autoScaling: false,
    loadBalancing: true,
  })

  if (isLoading) {
    return <div className="container mx-auto py-8">Loading...</div>
  }

  if (user?.role !== "ADMIN") {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-red-600">Access denied. Admin privileges required.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Enterprise Management</h1>
        <p className="text-gray-600">Multi-location management, security, and performance optimization</p>
      </div>

      <Tabs defaultValue="locations" className="space-y-6">
        <TabsList>
          <TabsTrigger value="locations">Locations</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="locations" className="space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Locations</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{locations.length}</div>
                <p className="text-xs text-muted-foreground">{locations.filter((l) => l.active).length} active</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Vehicles</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{locations.reduce((sum, loc) => sum + loc.vehicleCount, 0)}</div>
                <p className="text-xs text-muted-foreground">Across all locations</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Teams</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{locations.reduce((sum, loc) => sum + loc.teamCount, 0)}</div>
                <p className="text-xs text-muted-foreground">Active teams</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Health</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">99.9%</div>
                <p className="text-xs text-muted-foreground">Uptime this month</p>
              </CardContent>
            </Card>
          </div>

          {/* Location Management */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Location Management</CardTitle>
                  <CardDescription>Manage multiple facilities and their configurations</CardDescription>
                </div>
                <Button>Add Location</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {locations.map((location) => (
                  <div key={location.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <MapPin className="h-5 w-5 text-gray-500" />
                        <div>
                          <h3 className="font-semibold">{location.name}</h3>
                          <p className="text-sm text-gray-600">{location.address}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={location.active ? "default" : "secondary"}>
                          {location.active ? "Active" : "Inactive"}
                        </Badge>
                        <Button variant="outline" size="sm">
                          Configure
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Vehicles</p>
                        <p className="font-semibold">{location.vehicleCount}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Teams</p>
                        <p className="font-semibold">{location.teamCount}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Timezone</p>
                        <p className="font-semibold">{location.timezone.split("/")[1]}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Authentication & Access Control
              </CardTitle>
              <CardDescription>Configure security settings and access controls</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="sso-enabled">Single Sign-On (SSO)</Label>
                  <p className="text-sm text-gray-600">Enable SAML/OAuth integration</p>
                </div>
                <Switch
                  id="sso-enabled"
                  checked={securitySettings.ssoEnabled}
                  onCheckedChange={(checked) => setSecuritySettings((prev) => ({ ...prev, ssoEnabled: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="mfa-required">Multi-Factor Authentication</Label>
                  <p className="text-sm text-gray-600">Require MFA for all users</p>
                </div>
                <Switch
                  id="mfa-required"
                  checked={securitySettings.mfaRequired}
                  onCheckedChange={(checked) => setSecuritySettings((prev) => ({ ...prev, mfaRequired: checked }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                <Input
                  id="session-timeout"
                  type="number"
                  value={securitySettings.sessionTimeout}
                  onChange={(e) =>
                    setSecuritySettings((prev) => ({ ...prev, sessionTimeout: Number.parseInt(e.target.value) }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ip-whitelist">IP Whitelist</Label>
                <Input
                  id="ip-whitelist"
                  placeholder="192.168.1.0/24, 10.0.0.0/8"
                  value={securitySettings.ipWhitelist}
                  onChange={(e) => setSecuritySettings((prev) => ({ ...prev, ipWhitelist: e.target.value }))}
                />
                <p className="text-xs text-gray-500">Comma-separated list of allowed IP ranges</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Data Protection
              </CardTitle>
              <CardDescription>Configure data encryption and audit settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="audit-logging">Audit Logging</Label>
                  <p className="text-sm text-gray-600">Log all user actions and system events</p>
                </div>
                <Switch
                  id="audit-logging"
                  checked={securitySettings.auditLogging}
                  onCheckedChange={(checked) => setSecuritySettings((prev) => ({ ...prev, auditLogging: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="data-encryption">Data Encryption at Rest</Label>
                  <p className="text-sm text-gray-600">Encrypt sensitive data in database</p>
                </div>
                <Switch
                  id="data-encryption"
                  checked={securitySettings.dataEncryption}
                  onCheckedChange={(checked) => setSecuritySettings((prev) => ({ ...prev, dataEncryption: checked }))}
                />
              </div>

              <div className="border rounded-lg p-4 bg-green-50">
                <div className="flex items-center gap-2 mb-2">
                  <UserCheck className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-800">Security Score: 95/100</span>
                </div>
                <Progress value={95} className="h-2 mb-2" />
                <p className="text-sm text-green-700">Your security configuration is excellent</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Performance Optimization
              </CardTitle>
              <CardDescription>Configure system performance and scaling settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="cache-enabled">Application Caching</Label>
                  <p className="text-sm text-gray-600">Enable Redis caching for faster response times</p>
                </div>
                <Switch
                  id="cache-enabled"
                  checked={performanceSettings.cacheEnabled}
                  onCheckedChange={(checked) => setPerformanceSettings((prev) => ({ ...prev, cacheEnabled: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="compression-enabled">Response Compression</Label>
                  <p className="text-sm text-gray-600">Compress API responses to reduce bandwidth</p>
                </div>
                <Switch
                  id="compression-enabled"
                  checked={performanceSettings.compressionEnabled}
                  onCheckedChange={(checked) =>
                    setPerformanceSettings((prev) => ({ ...prev, compressionEnabled: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="cdn-enabled">Content Delivery Network</Label>
                  <p className="text-sm text-gray-600">Use CDN for static assets and images</p>
                </div>
                <Switch
                  id="cdn-enabled"
                  checked={performanceSettings.cdnEnabled}
                  onCheckedChange={(checked) => setPerformanceSettings((prev) => ({ ...prev, cdnEnabled: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-scaling">Auto Scaling</Label>
                  <p className="text-sm text-gray-600">Automatically scale resources based on demand</p>
                </div>
                <Switch
                  id="auto-scaling"
                  checked={performanceSettings.autoScaling}
                  onCheckedChange={(checked) => setPerformanceSettings((prev) => ({ ...prev, autoScaling: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="load-balancing">Load Balancing</Label>
                  <p className="text-sm text-gray-600">Distribute traffic across multiple servers</p>
                </div>
                <Switch
                  id="load-balancing"
                  checked={performanceSettings.loadBalancing}
                  onCheckedChange={(checked) => setPerformanceSettings((prev) => ({ ...prev, loadBalancing: checked }))}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Database Performance
              </CardTitle>
              <CardDescription>Monitor and optimize database performance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">12ms</p>
                  <p className="text-sm text-gray-600">Avg Query Time</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">1,247</p>
                  <p className="text-sm text-gray-600">Queries/min</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">89%</p>
                  <p className="text-sm text-gray-600">Cache Hit Rate</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">2.1GB</p>
                  <p className="text-sm text-gray-600">Database Size</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>CPU Usage</span>
                  <span>23%</span>
                </div>
                <Progress value={23} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Memory Usage</span>
                  <span>67%</span>
                </div>
                <Progress value={67} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Storage Usage</span>
                  <span>34%</span>
                </div>
                <Progress value={34} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Compliance & Governance
              </CardTitle>
              <CardDescription>Ensure regulatory compliance and data governance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <h3 className="font-semibold">GDPR Compliance</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">Data protection and privacy regulations compliance</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Data Retention Policy</span>
                      <span className="text-green-600">✓ Active</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Right to be Forgotten</span>
                      <span className="text-green-600">✓ Implemented</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Data Processing Consent</span>
                      <span className="text-green-600">✓ Tracked</span>
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <h3 className="font-semibold">SOC 2 Type II</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">Security, availability, and confidentiality controls</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Security Controls</span>
                      <span className="text-green-600">✓ Verified</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Availability Monitoring</span>
                      <span className="text-green-600">✓ Active</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Confidentiality Measures</span>
                      <span className="text-green-600">✓ Enforced</span>
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <h3 className="font-semibold">HIPAA Compliance</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">Healthcare data protection standards</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>PHI Encryption</span>
                      <span className="text-yellow-600">⚠ Partial</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Access Controls</span>
                      <span className="text-green-600">✓ Implemented</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Audit Trails</span>
                      <span className="text-green-600">✓ Complete</span>
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <h3 className="font-semibold">ISO 27001</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">Information security management system</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Risk Assessment</span>
                      <span className="text-green-600">✓ Current</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Security Policies</span>
                      <span className="text-green-600">✓ Updated</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Incident Response</span>
                      <span className="text-green-600">✓ Tested</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border rounded-lg p-4 bg-blue-50">
                <h3 className="font-semibold mb-2">Compliance Dashboard</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Overall Compliance Score</span>
                      <span className="font-medium">92%</span>
                    </div>
                    <Progress value={92} className="h-2" />
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Last Audit</p>
                      <p className="font-medium">March 15, 2024</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Next Review</p>
                      <p className="font-medium">June 15, 2024</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
