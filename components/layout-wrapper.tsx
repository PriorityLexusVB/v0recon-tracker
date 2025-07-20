"use client"

import type React from "react"

import { useAuth } from "@/hooks/use-auth"
import { Header } from "@/components/header"

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!isAuthenticated) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="pt-16">{children}</main>
    </div>
  )
}
