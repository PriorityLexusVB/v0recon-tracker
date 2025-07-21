// Define enums or string literal types for better type safety and clarity

export enum NotificationType {
  VEHICLE_COMPLETED = "VEHICLE_COMPLETED",
  ASSIGNMENT_UPDATE = "ASSIGNMENT_UPDATE",
  SYSTEM_ALERT = "SYSTEM_ALERT",
  PASSWORD_RESET = "PASSWORD_RESET",
  WELCOME = "WELCOME",
  NEW_VEHICLE_CHECK_IN = "NEW_VEHICLE_CHECK_IN",
  VEHICLE_ON_HOLD = "VEHICLE_ON_HOLD",
  VEHICLE_BACK_IN_PROGRESS = "VEHICLE_BACK_IN_PROGRESS",
  // Add more types as needed
}

export enum NotificationStatus {
  PENDING = "PENDING",
  SENT = "SENT",
  FAILED = "FAILED",
  READ = "READ",
  UNREAD = "UNREAD", // For client-side filtering, though 'read' boolean is primary
}

// You can also define interfaces for specific notification payloads if they have unique data
export interface VehicleCompletedNotificationPayload {
  vehicleId: string
  vin: string
  completedByUserId: string
  completedByName: string
}

export interface AssignmentUpdateNotificationPayload {
  vehicleId: string
  vin: string
  oldAssigneeId?: string
  newAssigneeId: string
}

// General notification interface (can extend Prisma's generated type)
import type { Notification as PrismaNotification } from "@prisma/client"

export interface AppNotification extends PrismaNotification {
  // Add any client-side specific fields if necessary
  // e.g., parsedMetadata?: VehicleCompletedNotificationPayload;
}
