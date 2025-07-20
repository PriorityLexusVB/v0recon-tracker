export interface User {
  id: string
  email: string
  name: string | null
  role: string
  teamId: string | null
  createdAt: Date
  updatedAt: Date
}

export interface Team {
  id: string
  name: string
  description: string | null
  createdAt: Date
  updatedAt: Date
}

export interface Vehicle {
  id: string
  vin: string
  make: string
  model: string
  year: number
  color: string | null
  mileage: number | null
  status: string
  priority: string
  teamId: string | null
  assignedTo: string | null
  createdAt: Date
  updatedAt: Date
  completedAt: Date | null
}

export interface ReconTask {
  id: string
  vehicleId: string
  name: string
  description: string | null
  status: string
  priority: string
  assignedTo: string | null
  estimatedHours: number | null
  actualHours: number | null
  createdAt: Date
  updatedAt: Date
  completedAt: Date | null
}

export type VehicleStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "ON_HOLD"
export type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT"
export type UserRole = "ADMIN" | "MANAGER" | "USER"
