"use client"

import type React from "react"

import { useState } from "react"
import { signIn, getSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Car, Shield, Users } from "lucide-react"
import { toast } from "sonner"

export default function SignInPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Invalid credentials")
        toast.error("Invalid credentials")
      } else {
        const session = await getSession()
        toast.success("Signed in successfully!")

        if (session?.user?.role === "ADMIN") {
          router.push("/admin")
        } else {
          router.push("/recon/cards")
        }
      }
    } catch (error) {
      setError("An error occurred")
      toast.error("An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoLogin = async (demoType: "admin" | "user") => {
    setIsLoading(true)
    setError("")

    const credentials = {
      admin: { email: "admin@recontracker.com", password: "admin123" },
      user: { email: "user@recontracker.com", password: "user123" },
    }

    try {
      const result = await signIn("credentials", {
        email: credentials[demoType].email,
        password: credentials[demoType].password,
        redirect: false,
      })

      if (result?.error) {
        setError("Demo login failed")
        toast.error("Demo login failed")
      } else {
        toast.success(`Signed in as ${demoType}!`)

        if (demoType === "admin") {
          router.push("/admin")
        } else {
          router.push("/recon/cards")
        }
      }
    } catch (error) {
      setError("Demo login failed")
      toast.error("Demo login failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center space-x-2 mb-6">
            <Car className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">Recon Tracker</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-gray-600">Sign in to your account</p>
        </div>

        {/* Demo Accounts */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleDemoLogin("admin")}>
            <CardContent className="p-4 text-center">
              <Shield className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-semibold text-sm">Admin Demo</h3>
              <p className="text-xs text-gray-600">Full access</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleDemoLogin("user")}>
            <CardContent className="p-4 text-center">
              <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-semibold text-sm">User Demo</h3>
              <p className="text-xs text-gray-600">Standard access</p>
            </CardContent>
          </Card>
        </div>

        {/* Sign In Form */}
        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>Enter your credentials to access your account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <Link href="/auth/signup" className="text-blue-600 hover:underline">
                  Sign up
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Demo Credentials */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Demo Credentials</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <div>
              <strong>Admin:</strong> admin@recontracker.com / admin123
            </div>
            <div>
              <strong>User:</strong> user@recontracker.com / user123
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
