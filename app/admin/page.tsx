import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { LayoutWrapper } from "@/components/layout-wrapper"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Users, Settings, BarChart3, Shield, UserCog, Building } from "lucide-react"

export default async function AdminPage() {
  const session = await auth()

  if (!session) {
    redirect("/auth/signin")
  }

  if (session.user.role !== "ADMIN") {
    redirect("/")
  }

  return (
    <LayoutWrapper>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Administration</h1>
          <p className="text-muted-foreground">Manage users, teams, and system settings</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserCog className="h-5 w-5 mr-2" />
                User Management
              </CardTitle>
              <CardDescription>Manage user accounts and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/users">
                <Button className="w-full">Manage Users</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="h-5 w-5 mr-2" />
                Team Management
              </CardTitle>
              <CardDescription>Create and manage teams</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/teams">
                <Button className="w-full">Manage Teams</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Vehicle Assignments
              </CardTitle>
              <CardDescription>Assign vehicles to teams and users</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/assignments">
                <Button className="w-full">Manage Assignments</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                System Settings
              </CardTitle>
              <CardDescription>Configure system preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/settings">
                <Button className="w-full">System Settings</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Reports & Analytics
              </CardTitle>
              <CardDescription>Generate system reports and analytics</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/analytics">
                <Button className="w-full">View Reports</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Team Performance
              </CardTitle>
              <CardDescription>Monitor team performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/team-performance">
                <Button className="w-full">View Performance</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="text-center py-8">
          <p className="text-muted-foreground">
            Welcome to the admin dashboard. Use the tools above to manage your Recon Tracker system.
          </p>
        </div>
      </div>
    </LayoutWrapper>
  )
}
