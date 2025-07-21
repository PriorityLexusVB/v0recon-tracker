"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState("")
  const [isError, setIsError] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage("")
    setIsError(false)

    try {
      // In a real application, you would send an email with a reset token
      // This is a mock API call
      const response = await fetch("/api/notifications/email/reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ to: email, token: "mock-reset-token-123" }), // Mock token
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setMessage("If an account with that email exists, a password reset link has been sent.")
        toast.success("Password reset email sent (if account exists).")
      } else {
        setMessage(data.error || "Failed to send password reset email. Please try again.")
        setIsError(true)
        toast.error(data.error || "Failed to send password reset email.")
      }
    } catch (error) {
      console.error("Forgot password error:", error)
      setMessage("An unexpected error occurred. Please try again.")
      setIsError(true)
      toast.error("An unexpected error occurred.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Forgot Password</CardTitle>
          <CardDescription>Enter your email to receive a password reset link.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            {message && <p className={`text-sm ${isError ? "text-red-500" : "text-green-600"}`}>{message}</p>}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Reset Link"
              )}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Remember your password?{" "}
            <Link href="/auth/signin" className="underline">
              Sign In
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
