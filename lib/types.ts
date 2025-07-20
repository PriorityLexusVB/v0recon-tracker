export interface Vehicle {
  vin: string
  stock: string
  make: string
  model: string
  year: number
  inventoryDate: string
  throughShop: boolean
  detailComplete: boolean
  photoComplete: boolean
  shopDone?: string
  detailDone?: string
  photoDone?: string
  assignedTeam?: string
  assignedUser?: string
  priority?: "low" | "normal" | "high" | "urgent"
  dueDate?: string
  notes?: string
}

export interface FilterState {
  search: string
  status: "all" | "pending" | "completed" | "overdue"
  activeStatFilter?: "total" | "completed" | "overdue"
  team?: string
  assignedUser?: string
  priority?: string
}

export interface VehicleStats {
  total: number
  completed: number
  overdue: number
  overdueShop: number
  overdueDetail: number
  overduePhoto: number
}

export interface Team {
  id: string
  name: string
  description?: string
  department: string
  isActive: boolean
  users: User[]
  vehicleCount: number
}

export interface User {
  id: string
  name?: string
  email: string
  role: string
  department: string
  teamId?: string
  team?: Team
}

export interface VehicleAssignment {
  id: string
  vin: string
  teamId: string
  userId?: string
  status: "assigned" | "in_progress" | "completed"
  priority: "low" | "normal" | "high" | "urgent"
  dueDate?: string
  notes?: string
  team: Team
  user?: User
}
