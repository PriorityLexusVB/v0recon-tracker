// This file is for defining common types and interfaces used throughout the application.
// It helps maintain consistency and provides a single source of truth for data structures.

import type { User, Vehicle, TimelineEvent, Notification, Team } from "@prisma/client"

// Extend Prisma's generated types if you need to add computed properties or relations
// that are not directly part of the database schema but are useful in the application logic.

export type UserWithTeam = User & {
  team?: Team | null
}

export type VehicleWithRelations = Vehicle & {
  assignedTo?: User | null
  timelineEvents?: TimelineEvent[]
}

export type TimelineEventWithRelations = TimelineEvent & {
  user?: User | null
  vehicle?: Vehicle | null
}

export type NotificationWithUser = Notification & {
  user?: User | null
}

// Analytics Types
export interface OverallAnalytics {
  totalVehicles: number
  vehiclesInProgress: number
  vehiclesCompletedLast30Days: number
  avgReconTime: number // in days
  totalReconCost: number
}

export interface DepartmentMetrics {
  department: string
  vehiclesCount: number
  avgTimeInDepartment: number // in days
  completedCount: number
}

export interface PerformanceTrend {
  period: string // e.g., "Jan", "Feb", "Week 1", "Day 1"
  vehiclesCompleted: number
  avgReconTime: number
}

export interface TeamPerformanceData {
  teamId: string
  teamName: string
  totalVehiclesProcessed: number
  avgReconTime: number // in days
  completionRate: number // percentage
  vehiclesByStatus: { status: string; count: number }[]
  monthlyPerformance: { month: string; vehiclesCompleted: number; avgTime: number }[]
}

// Form Validation Types (using Zod for schema definition)
// These are typically inferred from Zod schemas in server actions,
// but can be explicitly defined here if needed for client-side forms.

// Example:
// import { z } from 'zod';
// export const vehicleFormSchema = z.object({
//   vin: z.string().min(17).max(17),
//   make: z.string().min(1),
//   model: z.string().min(1),
//   year: z.number().int().min(1900).max(new Date().getFullYear() + 1),
// });
// export type VehicleFormData = z.infer<typeof vehicleFormSchema>;
