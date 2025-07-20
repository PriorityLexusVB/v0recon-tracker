export interface Notification {
  id: string
  type: "overdue" | "milestone" | "warning" | "info"
  title: string
  message: string
  vehicleVin?: string
  vehicleInfo?: string
  timestamp: string
  read: boolean
  priority: "low" | "medium" | "high"
  actionUrl?: string
}

export interface NotificationSettings {
  overdueEnabled: boolean
  milestoneEnabled: boolean
  warningEnabled: boolean
  overdueThreshold: number // days
  warningThreshold: number // days before overdue
  soundEnabled: boolean
  browserNotifications: boolean
}

export interface NotificationStats {
  unreadCount: number
  overdueCount: number
  milestoneCount: number
  warningCount: number
}
