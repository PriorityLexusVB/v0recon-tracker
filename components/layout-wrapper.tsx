import type React from "react"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/ui/sidebar" // Assuming Sidebar is now in ui
import { Package2 } from "lucide-react"
import Link from "next/link"
import { auth } from "@/lib/auth"

export async function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const session = await auth()
  const userRole = session?.user?.role

  const navItems = [
    { href: "/recon/cards", label: "Recon Board", icon: Package2 },
    { href: "/timeline", label: "Timeline", icon: Package2 },
    { href: "/analytics", label: "Analytics", icon: Package2 },
  ]

  if (userRole === "ADMIN" || userRole === "MANAGER") {
    navItems.push({ href: "/admin", label: "Admin", icon: Package2 })
  }

  navItems.push({ href: "/integrations", label: "Integrations", icon: Package2 })

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-16 items-center border-b px-4 lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <Package2 className="h-6 w-6" />
              <span className="">Recon Tracker</span>
            </Link>
          </div>
          <div className="flex-1">
            <Sidebar navItems={navItems} />
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <Header />
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">{children}</main>
      </div>
    </div>
  )
}
