"use client"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Bell, Settings } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useNotificationStore } from "@/lib/notification-store"
import { useAuth } from "@/hooks/use-auth"
import { NotificationSettingsModal } from "./notifications/notification-settings-modal"
import { useState } from "react"
import { formatDistanceToNow } from "date-fns"

export function NotificationBell() {
  const { user } = useAuth()
  const { unreadCount, notifications, markAsRead, fetchNotifications } = useNotificationStore(user?.id)
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)

  const handleNotificationClick = async (notificationId: string) => {
    await markAsRead(notificationId)
    // Optionally navigate to a relevant page based on notification type
    // e.g., router.push(`/vehicles/${notification.metadata.vehicleId}`);
  }

  const handleViewAllNotifications = () => {
    // Implement navigation to a dedicated notifications page
    console.log("View all notifications clicked")
    // router.push('/notifications');
  }

  return (
    <>
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
            <Button variant="ghost" size="sm" onClick={() => setIsSettingsModalOpen(true)}>
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
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
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
      <NotificationSettingsModal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} />
    </>
  )
}
