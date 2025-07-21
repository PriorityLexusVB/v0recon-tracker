"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useFormStatus } from "react-dom"
import { authenticate } from "@/app/actions/auth"
import { useFormState } from "react-dom"
import { Loader2 } from "lucide-react"

function SignInButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" className="w-full" aria-disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Signing In...
        </>
      ) : (
        "Sign In"
      )}
    </Button>
  )
}

export default function SignInPage() {
  const [errorMessage, dispatch] = useFormState(authenticate, undefined)

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
          <CardDescription>Enter your credentials to access your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={dispatch} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="m@example.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            {errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}
            <SignInButton />
          </form>
          <div className="mt-4 text-center text-sm">
            Don't have an account?{" "}
            <Link href="/auth/signup" className="underline">
              Sign Up
            </Link>
          </div>
          <div className="mt-2 text-center text-sm">
            <Link href="/auth/forgot-password" className="underline">
              Forgot Password?
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
