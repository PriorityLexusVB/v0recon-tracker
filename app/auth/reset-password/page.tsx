"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Loader2 } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { toast } from "sonner"
import ResetPasswordLoading from "@/components/ResetPasswordLoading" // Declare the variable before using it

export default function ResetPasswordPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState("")
  const [isError, setIsError] = useState(false)
  const [isValidToken, setIsValidToken] = useState(false)
  const [isLoadingToken, setIsLoadingToken] = useState(true)

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setMessage("No reset token provided.")
        setIsError(true)
        setIsValidToken(false)
        setIsLoadingToken(false)
        return
      }

      try {
        // In a real application, you would validate the token against your backend
        // This is a mock validation
        const response = (await new Promise((resolve) =>
          setTimeout(() => {
            if (token === "mock-reset-token-123") {
              resolve({ ok: true, json: () => Promise.resolve({ success: true }) })
            } else {
              resolve({
                ok: false,
                json: () => Promise.resolve({ success: false, error: "Invalid or expired token." }),
              })
            }
          }, 500),
        )) as Response

        const data = await response.json()

        if (response.ok && data.success) {
          setIsValidToken(true)
          setMessage("Enter your new password.")
        } else {
          setMessage(data.error || "Invalid or expired reset token.")
          setIsError(true)
          setIsValidToken(false)
        }
      } catch (error) {
        console.error("Token validation error:", error)
        setMessage("An error occurred while validating the token.")
        setIsError(true)
        setIsValidToken(false)
      } finally {
        setIsLoadingToken(false)
      }
    }

    validateToken()
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage("")
    setIsError(false)

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.")
      setIsError(true)
      setIsSubmitting(false)
      return
    }

    if (password.length < 8) {
      setMessage("Password must be at least 8 characters long.")
      setIsError(true)
      setIsSubmitting(false)
      return
    }

    try {
      // In a real application, you would send the new password and token to your backend
      // This is a mock API call
      const response = (await new Promise((resolve) =>
        setTimeout(() => {
          if (token === "mock-reset-token-123") {
            resolve({ ok: true, json: () => Promise.resolve({ success: true }) })
          } else {
            resolve({ ok: false, json: () => Promise.resolve({ success: false, error: "Failed to reset password." }) })
          }
        }, 1000),
      )) as Response

      const data = await response.json()

      if (response.ok && data.success) {
        setMessage("Your password has been reset successfully. You can now sign in.")
        toast.success("Password reset successfully!")
      } else {
        setMessage(data.error || "Failed to reset password. Please try again.")
        setIsError(true)
        toast.error(data.error || "Failed to reset password.")
      }
    } catch (error) {
      console.error("Reset password error:", error)
      setMessage("An unexpected error occurred. Please try again.")
      setIsError(true)
      toast.error("An unexpected error occurred.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoadingToken) {
    return <ResetPasswordLoading />
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent>
          {isValidToken ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              {isError && <p className="text-sm text-red-500">{message}</p>}
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  "Reset Password"
                )}
              </Button>
            </form>
          ) : (
            <div className="text-center">
              <p className="text-sm text-red-500 mb-4">{message}</p>
              <Link href="/auth/forgot-password" className="underline text-sm">
                Request a new reset link
              </Link>
            </div>
          )}
          <div className="mt-4 text-center text-sm">
            <Link href="/auth/signin" className="underline">
              Back to Sign In
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
