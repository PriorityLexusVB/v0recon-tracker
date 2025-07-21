"use client"

import type React from "react"

import { useState, useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { resetPassword } from "@/app/actions/auth" // Assuming this server action exists

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isPending, startTransition] = useTransition()
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    if (!token) {
      setErrors({ general: "Password reset token is missing." })
      toast.error("Password reset token is missing.")
      return
    }

    if (password !== confirmPassword) {
      setErrors({ confirmPassword: "Passwords do not match." })
      toast.error("Passwords do not match.")
      return
    }

    if (password.length < 6) {
      setErrors({ password: "Password must be at least 6 characters long." })
      toast.error("Password must be at least 6 characters long.")
      return
    }

    startTransition(async () => {
      try {
        const result = await resetPassword(token, password)
        if (result.success) {
          toast.success("Your password has been reset successfully. Please sign in.")
          router.push("/auth/signin")
        } else {
          setErrors({ general: result.message || "Failed to reset password." })
          toast.error(result.message || "Failed to reset password.")
        }
      } catch (error) {
        setErrors({ general: "An unexpected error occurred." })
        toast.error("An unexpected error occurred.")
        console.error("Reset password error:", error)
      }
    })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Reset Password</CardTitle>
          <CardDescription className="text-center">Enter your new password below.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isPending}
              />
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isPending}
              />
              {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
            </div>
            {errors.general && <p className="text-red-500 text-sm text-center">{errors.general}</p>}
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resetting...
                </>
              ) : (
                "Reset Password"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
