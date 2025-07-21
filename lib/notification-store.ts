"use client"

// This file could be used for client-side state management for notifications
// For example, using Zustand or React Context to manage notification display
// and real-time updates.

// Example (using a simplified approach, not a full state management library)

import { useState, useEffect, useCallback } from "react"
import type { Notification } from "@prisma/client" // Import Prisma's generated Notification type
import {
  getNotificationsForUser,
  markNotificationAsRead,
  getUnreadNotificationsCount,
} from "@/lib/notification-service" // Import server actions

interface NotificationStore {
  notifications: Notification[]
  unreadCount: number
  loading: boolean
  error: string | null
  fetchNotifications: (page?: number, pageSize?: number) => Promise<void>
  markAsRead: (id: string) => Promise<void>
  refreshUnreadCount: () => Promise<void>
}

export function useNotificationStore(userId: string | undefined): NotificationStore {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refreshUnreadCount = useCallback(async () => {
    if (!userId) {
      setUnreadCount(0)
      return
    }
    try {
      const result = await getUnreadNotificationsCount(userId)
      if (result.success) {
        setUnreadCount(result.count)
      } else {
        setError(result.message || "Failed to refresh unread count.")
      }
    } catch (err) {
      setError("Failed to refresh unread count.")
      console.error("Error refreshing unread count:", err)
    }
  }, [userId])

  const fetchNotifications = useCallback(
    async (page = 1, pageSize = 10) => {
      if (!userId) {
        setNotifications([])
        setLoading(false)
        return
      }
      setLoading(true)
      setError(null)
      try {
        const result = await getNotificationsForUser(userId, page, pageSize)
        if (result.success) {
          setNotifications(result.notifications)
        } else {
          setError(result.message || "Failed to fetch notifications.")
        }
      } catch (err) {
        setError("Failed to fetch notifications.")
        console.error("Error fetching notifications:", err)
      } finally {
        setLoading(false)
      }
    },
    [userId],
  )

  const markAsRead = useCallback(
    async (id: string) => {
      try {
        const result = await markNotificationAsRead(id)
        if (result.success) {
          setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
          refreshUnreadCount() // Update unread count after marking as read
        } else {
          setError(result.message || "Failed to mark notification as read.")
        }
      } catch (err) {
        setError("Failed to mark notification as read.")
        console.error("Error marking notification as read:", err)
      }
    },
    [refreshUnreadCount],
  )

  useEffect(() => {
    fetchNotifications()
    refreshUnreadCount()
    // Optionally, set up a polling mechanism or WebSocket for real-time updates
    // const interval = setInterval(refreshUnreadCount, 60000); // Poll every minute
    // return () => clearInterval(interval);
  }, [userId, fetchNotifications, refreshUnreadCount])

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    refreshUnreadCount,
  }
}
