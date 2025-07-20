import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Car, BarChart3, Users, Clock, Shield, Smartphone, Bell } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Car className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Recon Tracker</h1>
          </div>
          <div className="flex space-x-4">
            <Link href="/auth/signin">
              <Button variant="outline">Sign In</Button>
            </Link>
            <Link href="/auth/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <Badge className="mb-4" variant="secondary">
            Professional Vehicle Management
          </Badge>
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Streamline Your Vehicle
            <span className="text-blue-600"> Reconditioning Process</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Track, manage, and optimize your vehicle reconditioning workflow with real-time analytics, team
            collaboration, and automated notifications.
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/auth/signin">
              <Button size="lg" className="px-8">
                Try Demo
              </Button>
            </Link>
            <Link href="/mobile">
              <Button size="lg" variant="outline" className="px-8 bg-transparent">
                View Mobile Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Everything You Need to Manage Vehicle Reconditioning
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              From intake to delivery, track every step of your reconditioning process with powerful tools and insights.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Car className="h-10 w-10 text-blue-600 mb-2" />
                <CardTitle>Vehicle Tracking</CardTitle>
                <CardDescription>
                  Track every vehicle through the reconditioning process with real-time status updates
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <BarChart3 className="h-10 w-10 text-green-600 mb-2" />
                <CardTitle>Analytics Dashboard</CardTitle>
                <CardDescription>
                  Get insights into performance metrics, bottlenecks, and team productivity
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-10 w-10 text-purple-600 mb-2" />
                <CardTitle>Team Management</CardTitle>
                <CardDescription>Assign tasks, track progress, and manage team workloads efficiently</CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Clock className="h-10 w-10 text-orange-600 mb-2" />
                <CardTitle>Timeline Tracking</CardTitle>
                <CardDescription>Monitor reconditioning timelines and identify process improvements</CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Bell className="h-10 w-10 text-red-600 mb-2" />
                <CardTitle>Smart Notifications</CardTitle>
                <CardDescription>Get alerts for delays, completions, and important milestones</CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Smartphone className="h-10 w-10 text-indigo-600 mb-2" />
                <CardTitle>Mobile Ready</CardTitle>
                <CardDescription>Access your dashboard anywhere with our responsive mobile interface</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Demo Accounts Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Try Our Demo</h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Experience the full power of Recon Tracker with our demo accounts
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <Shield className="h-10 w-10 text-blue-600 mb-2" />
                <CardTitle>Admin Demo</CardTitle>
                <CardDescription>
                  Full access to all features including analytics, team management, and system settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  <p className="text-sm">
                    <strong>Email:</strong> admin@recontracker.com
                  </p>
                  <p className="text-sm">
                    <strong>Password:</strong> admin123
                  </p>
                </div>
                <Link href="/auth/signin">
                  <Button className="w-full">Try Admin Demo</Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-10 w-10 text-green-600 mb-2" />
                <CardTitle>User Demo</CardTitle>
                <CardDescription>
                  Experience the user interface for tracking vehicles and managing daily tasks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  <p className="text-sm">
                    <strong>Email:</strong> user@recontracker.com
                  </p>
                  <p className="text-sm">
                    <strong>Password:</strong> user123
                  </p>
                </div>
                <Link href="/auth/signin">
                  <Button className="w-full bg-transparent" variant="outline">
                    Try User Demo
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-blue-100">Vehicles Tracked</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">25%</div>
              <div className="text-blue-100">Faster Processing</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">98%</div>
              <div className="text-blue-100">Uptime</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">24/7</div>
              <div className="text-blue-100">Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Car className="h-6 w-6" />
                <span className="text-xl font-bold">Recon Tracker</span>
              </div>
              <p className="text-gray-400">Professional vehicle reconditioning management system</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/features">Features</Link>
                </li>
                <li>
                  <Link href="/pricing">Pricing</Link>
                </li>
                <li>
                  <Link href="/mobile">Mobile App</Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/about">About</Link>
                </li>
                <li>
                  <Link href="/contact">Contact</Link>
                </li>
                <li>
                  <Link href="/support">Support</Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/privacy">Privacy</Link>
                </li>
                <li>
                  <Link href="/terms">Terms</Link>
                </li>
                <li>
                  <Link href="/security">Security</Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Recon Tracker. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
