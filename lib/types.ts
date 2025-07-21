// lib/types.ts
import type {
  User as PrismaUser,
  Vehicle as PrismaVehicle,
  Team as PrismaTeam,
  TimelineEvent as PrismaTimelineEvent,
  Notification as PrismaNotification,
} from "@prisma/client"

// Extend Prisma's generated types for more specific use cases or additional fields
export interface User extends PrismaUser {
  team?: Team | null
}

export interface Team extends PrismaTeam {
  members?: User[]
}

export interface Vehicle extends PrismaVehicle {
  assignedTo?: User | null
  timelineEvents?: TimelineEvent[]
}

export interface TimelineEvent extends PrismaTimelineEvent {
  user?: User | null
  vehicle?: Vehicle | null
}

export interface Notification extends PrismaNotification {
  user?: User | null
}

// Define types for API responses or component props
export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  errors?: Record<string, string[]> // For validation errors
}

export interface PaginatedResponse<T> {
  data: T[]
  totalPages: number
  currentPage: number
  totalItems: number
}

export interface FilterState {
  search: string
  status: string // e.g., "ALL", "IN_PROGRESS", "COMPLETED"
  assignedTo?: string // User ID
  activeStatFilter?: "total" | "completed" | "overdue" | "overdueShop" | "overdueDetail" | "overduePhoto" | undefined
}

export interface VehicleStats {
  total: number
  completed: number
  overdue: number
  overdueShop: number
  overdueDetail: number
  overduePhoto: number
}

export interface OverallAnalytics {
  totalVehicles: number
  vehiclesInProgress: number
  vehiclesCompletedLast30Days: number
  avgReconTime: number // in days
  totalReconCost: number // total cost of reconditioning
}

export interface DepartmentMetrics {
  department: string
  vehiclesCount: number
  avgTimeInDepartment: number // in days
  completedCount: number
}

export interface PerformanceTrend {
  period: string // e.g., "Jan 2023", "2023-01-15"
  vehiclesCompleted: number
  avgReconTime: number // in days
}

export interface TeamPerformanceData {
  teamId: string
  teamName: string
  totalVehiclesProcessed: number
  avgReconTime: number
  completionRate: number
  vehiclesByStatus: { status: string; count: number }[]
  monthlyPerformance: { month: string; vehiclesCompleted: number; avgTime: number }[]
}
