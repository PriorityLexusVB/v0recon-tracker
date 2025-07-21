"use client"

import type React from "react"

import { Header } from "@/components/header"
import { Sidebar } from "@/components/ui/sidebar" // Assuming this is a placeholder for a sidebar component
import { useMobile } from "@/hooks/use-mobile" // Assuming this hook exists
import { usePathname } from "next/navigation"

interface LayoutWrapperProps {
  children: React.ReactNode
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const { isMobile } = useMobile()
  const pathname = usePathname()

  // Define paths where the sidebar should NOT be shown
  const noSidebarPaths = [
    "/auth/signin",
    "/auth/signup",
    "/auth/forgot-password",
    "/auth/reset-password",
    "/deployment-success",
    "/mobile", // Mobile specific page might not need a full sidebar
  ]

  const showSidebar = !noSidebarPaths.some((path) => pathname.startsWith(path))

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <div className="flex flex-1">
        {showSidebar && !isMobile && <Sidebar />} {/* Render sidebar only if not mobile and not on no-sidebar paths */}
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">{children}</main>
      </div>
    </div>
  )
}
