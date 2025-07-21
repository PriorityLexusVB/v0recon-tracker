"use client"

import type React from "react"

import { useState, useTransition } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { sendPasswordResetEmail } from "@/app/actions/auth" // Assuming this server action exists

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMessage(null)

    if (!email) {
      setError("Please enter your email address.")
      toast.error("Please enter your email address.")
      return
    }

    startTransition(async () => {
      try {
        const result = await sendPasswordResetEmail(email)
        if (result.success) {
          setSuccessMessage("If an account with that email exists, a password reset link has been sent to your inbox.")
          toast.success("Password reset email sent (if account exists).")
          setEmail("") // Clear email input
        } else {
          setError(result.message || "Failed to send password reset email.")
          toast.error(result.message || "Failed to send password reset email.")
        }
      } catch (err) {
        setError("An unexpected error occurred.")
        toast.error("An unexpected error occurred.")
        console.error("Forgot password error:", err)
      }
    })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Forgot Password?</CardTitle>
          <CardDescription className="text-center">
            Enter your email address below and we'll send you a link to reset your password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isPending}
              />
              {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            </div>
            {successMessage && <p className="text-green-600 text-sm text-center">{successMessage}</p>}
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Reset Link"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
