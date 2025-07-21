import { Card, CardDescription, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Car, Settings, LayoutDashboard, Shield, Bell } from "lucide-react"
import Link from "next/link"

export default function AdminDashboardPage() {
  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-50 mb-4">Admin Dashboard</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          Manage users, teams, system settings, and monitor overall application health.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* User Management */}
        <Card className="flex flex-col items-center text-center p-6 shadow-lg hover:shadow-xl transition-shadow">
          <Users className="h-12 w-12 text-primary mb-4" />
          <CardTitle className="text-2xl font-semibold mb-2">User Management</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400 mb-4 flex-grow">
            Add, edit, and remove users. Assign roles and manage user access permissions.
          </CardDescription>
          <Link href="/admin/users" passHref>
            <Button variant="outline" className="w-full mt-auto bg-transparent">
              Manage Users
            </Button>
          </Link>
        </Card>

        {/* Team Management */}
        <Card className="flex flex-col items-center text-center p-6 shadow-lg hover:shadow-xl transition-shadow">
          <LayoutDashboard className="h-12 w-12 text-primary mb-4" />
          <CardTitle className="text-2xl font-semibold mb-2">Team Management</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400 mb-4 flex-grow">
            Create and manage teams, assign users to teams, and view team-specific performance.
          </CardDescription>
          <Link href="/admin/teams" passHref>
            <Button variant="outline" className="w-full mt-auto bg-transparent">
              Manage Teams
            </Button>
          </Link>
        </Card>

        {/* Assignment Management */}
        <Card className="flex flex-col items-center text-center p-6 shadow-lg hover:shadow-xl transition-shadow">
          <Car className="h-12 w-12 text-primary mb-4" />
          <CardTitle className="text-2xl font-semibold mb-2">Assignment Management</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400 mb-4 flex-grow">
            Oversee and reassign vehicle reconditioning tasks to users and teams.
          </CardDescription>
          <Link href="/admin/assignments" passHref>
            <Button variant="outline" className="w-full mt-auto bg-transparent">
              Manage Assignments
            </Button>
          </Link>
        </Card>

        {/* System Settings */}
        <Card className="flex flex-col items-center text-center p-6 shadow-lg hover:shadow-xl transition-shadow">
          <Settings className="h-12 w-12 text-primary mb-4" />
          <CardTitle className="text-2xl font-semibold mb-2">System Settings</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400 mb-4 flex-grow">
            Configure application-wide settings, integrations, and data synchronization.
          </CardDescription>
          <Link href="/admin/settings" passHref>
            <Button variant="outline" className="w-full mt-auto bg-transparent">
              Configure Settings
            </Button>
          </Link>
        </Card>

        {/* Security & Audit Logs */}
        <Card className="flex flex-col items-center text-center p-6 shadow-lg hover:shadow-xl transition-shadow">
          <Shield className="h-12 w-12 text-primary mb-4" />
          <CardTitle className="text-2xl font-semibold mb-2">Security & Audit Logs</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400 mb-4 flex-grow">
            Review system activity, audit trails, and manage security configurations.
          </CardDescription>
          <Link href="/admin/security" passHref>
            <Button variant="outline" className="w-full mt-auto bg-transparent">
              View Logs
            </Button>
          </Link>
        </Card>

        {/* Notification Templates */}
        <Card className="flex flex-col items-center text-center p-6 shadow-lg hover:shadow-xl transition-shadow">
          <Bell className="h-12 w-12 text-primary mb-4" />
          <CardTitle className="text-2xl font-semibold mb-2">Notification Templates</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400 mb-4 flex-grow">
            Customize email and SMS notification templates for various events.
          </CardDescription>
          <Link href="/admin/notifications" passHref>
            <Button variant="outline" className="w-full mt-auto bg-transparent">
              Manage Templates
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  )
}
