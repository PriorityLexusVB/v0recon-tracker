"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Package2, Menu, Bell, Home, Car, Clock, BarChart, Settings, Shield } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { signOut } from "next-auth/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useNotificationStore } from "@/lib/notification-store"
import { NotificationSettingsModal } from "./notifications/notification-settings-modal"
import { useState } from "react"

export function Header() {
  const { setTheme } = useTheme()
  const { user, isLoading } = useAuth()
  const { unreadCount, notifications, markAsRead, fetchNotifications } = useNotificationStore(user?.id)
  const [isNotificationSettingsOpen, setIsNotificationSettingsOpen] = useState(false)

  const handleNotificationClick = async (notificationId: string) => {
    await markAsRead(notificationId)
    // Optionally navigate to a relevant page based on notification type
  }

  const handleViewAllNotifications = () => {
    // Navigate to a dedicated notifications page or open a larger modal
    console.log("View all notifications clicked")
    // Example: router.push('/notifications');
  }

  return (
    <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 z-50">
      <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
        <Link href="#" className="flex items-center gap-2 text-lg font-semibold md:text-base">
          <Package2 className="h-6 w-6" />
          <span className="sr-only">Recon Tracker</span>
        </Link>
        <Link href="/" className="text-muted-foreground transition-colors hover:text-foreground">
          <Home className="h-4 w-4 mr-1 inline-block" /> Dashboard
        </Link>
        <Link href="/recon/cards" className="text-muted-foreground transition-colors hover:text-foreground">
          <Car className="h-4 w-4 mr-1 inline-block" /> Recon Board
        </Link>
        <Link href="/timeline" className="text-muted-foreground transition-colors hover:text-foreground">
          <Clock className="h-4 w-4 mr-1 inline-block" /> Timeline
        </Link>
        <Link href="/analytics" className="text-muted-foreground transition-colors hover:text-foreground">
          <BarChart className="h-4 w-4 mr-1 inline-block" /> Analytics
        </Link>
        {user?.role === "ADMIN" && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Link href="#" className="text-muted-foreground transition-colors hover:text-foreground">
                <Shield className="h-4 w-4 mr-1 inline-block" /> Admin
              </Link>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>Admin Tools</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/admin/users">Users</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/admin/teams">Teams</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/admin/assignments">Assignments</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/admin/team-performance">Team Performance</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/admin/settings">System Settings</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </nav>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden bg-transparent">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <nav className="grid gap-6 text-lg font-medium">
            <Link href="#" className="flex items-center gap-2 text-lg font-semibold">
              <Package2 className="h-6 w-6" />
              <span className="sr-only">Recon Tracker</span>
            </Link>
            <Link href="/" className="hover:text-foreground">
              Dashboard
            </Link>
            <Link href="/recon/cards" className="text-muted-foreground hover:text-foreground">
              Recon Board
            </Link>
            <Link href="/timeline" className="text-muted-foreground hover:text-foreground">
              Timeline
            </Link>
            <Link href="/analytics" className="text-muted-foreground hover:text-foreground">
              Analytics
            </Link>
            {user?.role === "ADMIN" && (
              <>
                <h3 className="text-sm font-semibold text-muted-foreground mt-4">Admin Tools</h3>
                <Link href="/admin/users" className="text-muted-foreground hover:text-foreground">
                  Users
                </Link>
                <Link href="/admin/teams" className="text-muted-foreground hover:text-foreground">
                  Teams
                </Link>
                <Link href="/admin/assignments" className="text-muted-foreground hover:text-foreground">
                  Assignments
                </Link>
                <Link href="/admin/team-performance" className="text-muted-foreground hover:text-foreground">
                  Team Performance
                </Link>
                <Link href="/admin/settings" className="text-muted-foreground hover:text-foreground">
                  System Settings
                </Link>
              </>
            )}
          </nav>
        </SheetContent>
      </Sheet>
      <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <div className="ml-auto flex-1 sm:flex-initial">{/* Search bar can go here if needed */}</div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-xs"
                >
                  {unreadCount}
                </Badge>
              )}
              <span className="sr-only">Toggle notifications</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex justify-between items-center">
              Notifications
              <Button variant="ghost" size="sm" onClick={() => setIsNotificationSettingsOpen(true)}>
                <Settings className="h-4 w-4 mr-1" /> Settings
              </Button>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.length === 0 ? (
              <DropdownMenuItem className="text-muted-foreground">No new notifications.</DropdownMenuItem>
            ) : (
              notifications.slice(0, 5).map(
                (
                  notification, // Show latest 5
                ) => (
                  <DropdownMenuItem
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification.id)}
                    className="flex flex-col items-start gap-1"
                  >
                    <div className="font-medium">{notification.type.replace(/_/g, " ")}</div>
                    <div className="text-sm text-muted-foreground">{notification.message}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(notification.createdAt).toLocaleString()}
                    </div>
                  </DropdownMenuItem>
                ),
              )
            )}
            {notifications.length > 5 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleViewAllNotifications} className="text-center justify-center">
                  View All Notifications
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon" className="rounded-full">
              <Avatar>
                <AvatarImage src={user?.image || "/placeholder-user.jpg"} alt={user?.name || "User"} />
                <AvatarFallback>{user?.name?.charAt(0) || user?.email?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
              <span className="sr-only">Toggle user menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              {isLoading ? "Loading..." : user?.name || user?.email || "My Account"}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/support">Support</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/auth/signin" })}>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTheme("light")}>Light</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>Dark</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")}>System</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <NotificationSettingsModal
        isOpen={isNotificationSettingsOpen}
        onClose={() => setIsNotificationSettingsOpen(false)}
      />
    </header>
  )
}
