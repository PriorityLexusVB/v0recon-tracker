"use client"

import { useAuth } from "@/hooks/use-auth"
import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Car, BarChart3, Settings, LogOut, Users, Smartphone } from "lucide-react"
import Link from "next/link"

export function Header() {
  const { user } = useAuth()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <Link href="/" className="flex items-center space-x-2">
            <Car className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold">Recon Tracker</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-4">
            <Link href="/recon/cards" className="text-gray-600 hover:text-gray-900">
              Dashboard
            </Link>
            <Link href="/analytics" className="text-gray-600 hover:text-gray-900 flex items-center gap-1">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </Link>
            <Link href="/mobile" className="text-gray-600 hover:text-gray-900 flex items-center gap-1">
              <Smartphone className="h-4 w-4" />
              Mobile
            </Link>
            {(user?.role === "admin" || user?.role === "manager") && (
              <Link href="/admin/teams" className="text-gray-600 hover:text-gray-900 flex items-center gap-1">
                <Users className="h-4 w-4" />
                Teams
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{user?.name?.charAt(0) || user?.email?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <div className="flex flex-col space-y-1 p-2">
                <p className="text-sm font-medium leading-none">{user?.name}</p>
                <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
              </div>
              <DropdownMenuItem asChild>
                <Link href="/settings" className="flex items-center">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => signOut()}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
