"use client"

import { create } from "zustand"
import {
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from "@/app/actions/notifications"
import type { Notification, PaginatedResponse } from "@/lib/types"
import { NotificationStatus } from "@/lib/notification-types"

interface NotificationStore {
  notifications: Notification[]
  unreadCount: number
  loading: boolean
  error: string | null
  fetchNotifications: (page?: number, pageSize?: number) => Promise<void>
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  deleteNotification: (id: string) => Promise<void>
  refreshUnreadCount: () => Promise<void>
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  unreadCount: 0,
  loading: true,
  error: null,
  fetchNotifications: async (page = 1, pageSize = 10) => {
    set({ loading: true, error: null })
    try {
      const result: PaginatedResponse<Notification> = await fetchNotifications(page, pageSize)
      if (result.success) {
        set({ notifications: result.notifications })
      } else {
        set({ error: result.message || "Failed to fetch notifications." })
      }
    } catch (err) {
      set({ error: "Failed to fetch notifications." })
      console.error("Error fetching notifications:", err)
    } finally {
      set({ loading: false })
    }
  },
  markAsRead: async (id: string) => {
    try {
      const result = await markNotificationAsRead(id)
      if (result.success) {
        set((state) => ({
          notifications: state.notifications.map((n) => (n.id === id ? { ...n, status: NotificationStatus.Read } : n)),
        }))
        set((state) => ({ unreadCount: state.unreadCount - 1 }))
      } else {
        set({ error: result.message || "Failed to mark notification as read." })
      }
    } catch (err) {
      set({ error: "Failed to mark notification as read." })
      console.error("Error marking notification as read:", err)
    }
  },
  markAllAsRead: async () => {
    try {
      const result = await markAllNotificationsAsRead()
      if (result.success) {
        set({ notifications: result.notifications.map((n) => ({ ...n, status: NotificationStatus.Read })) })
        set({ unreadCount: 0 })
      } else {
        set({ error: result.message || "Failed to mark all notifications as read." })
      }
    } catch (err) {
      set({ error: "Failed to mark all notifications as read." })
      console.error("Error marking all notifications as read:", err)
    }
  },
  deleteNotification: async (id: string) => {
    try {
      const result = await deleteNotification(id)
      if (result.success) {
        set((state) => ({ notifications: state.notifications.filter((n) => n.id !== id) }))
      } else {
        set({ error: result.message || "Failed to delete notification." })
      }
    } catch (err) {
      set({ error: "Failed to delete notification." })
      console.error("Error deleting notification:", err)
    }
  },
  refreshUnreadCount: async () => {
    set({ loading: true, error: null })
    try {
      const result = await fetchNotifications(1, 100) // Fetch all notifications to count unread
      if (result.success) {
        const count = result.notifications.filter((n) => n.status !== NotificationStatus.Read).length
        set({ unreadCount: count })
      } else {
        set({ error: result.message || "Failed to refresh unread count." })
      }
    } catch (err) {
      set({ error: "Failed to refresh unread count." })
      console.error("Error refreshing unread count:", err)
    } finally {
      set({ loading: false })
    }
  },
}))

// Optionally, set up a polling mechanism or WebSocket for real-time updates
// const interval = setInterval(useNotificationStore.getState().refreshUnreadCount, 60000); // Poll every minute
// return () => clearInterval(interval);
