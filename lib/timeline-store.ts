import { create } from "zustand"
import { persist } from "zustand/middleware"
import { notificationService } from "./notification-service"

export interface TimelineGoals {
  shop: { target: number; warning: number }
  detail: { target: number; warning: number }
  photo: { target: number; warning: number }
  total: { target: number; warning: number }
}

export interface TimelineAlert {
  id: string
  vehicleId: string
  vehicleInfo: string
  vin: string
  step: string
  type: "warning" | "overdue"
  currentDays: number
  targetDays: number
  message: string
  timestamp: Date
  acknowledged: boolean
}

interface TimelineState {
  goals: TimelineGoals
  alerts: TimelineAlert[]
  updateGoals: (newGoals: TimelineGoals) => void
  resetGoalsToDefaults: () => void
  addAlert: (alert: Omit<TimelineAlert, "id" | "timestamp" | "acknowledged">) => void
  acknowledgeAlert: (alertId: string) => void
  dismissAlert: (alertId: string) => void
  clearAllAlerts: () => void
  checkVehicleTimeline: (vehicle: any) => void
}

const defaultGoals: TimelineGoals = {
  shop: { target: 5, warning: 80 },
  detail: { target: 2, warning: 80 },
  photo: { target: 1, warning: 80 },
  total: { target: 8, warning: 80 },
}

export const useTimelineStore = create<TimelineState>()(
  persist(
    (set, get) => ({
      goals: defaultGoals,
      alerts: [],

      updateGoals: (newGoals) => {
        set({ goals: newGoals })
      },

      resetGoalsToDefaults: () => {
        set({ goals: defaultGoals })
      },

      addAlert: (alertData) => {
        const alert: TimelineAlert = {
          ...alertData,
          id: `${alertData.vehicleId}-${alertData.step}-${Date.now()}`,
          timestamp: new Date(),
          acknowledged: false,
        }

        set((state) => ({
          alerts: [...state.alerts.filter((a) => !(a.vehicleId === alert.vehicleId && a.step === alert.step)), alert],
        }))

        // Send notification
        notificationService.sendTimelineAlert({
          vehicleInfo: alert.vehicleInfo,
          vin: alert.vin,
          step: alert.step,
          type: alert.type,
          currentDays: alert.currentDays,
          targetDays: alert.targetDays,
          message: alert.message,
        })
      },

      acknowledgeAlert: (alertId) => {
        set((state) => ({
          alerts: state.alerts.map((alert) => (alert.id === alertId ? { ...alert, acknowledged: true } : alert)),
        }))
      },

      dismissAlert: (alertId) => {
        set((state) => ({
          alerts: state.alerts.filter((alert) => alert.id !== alertId),
        }))
      },

      clearAllAlerts: () => {
        set({ alerts: [] })
      },

      checkVehicleTimeline: (vehicle) => {
        const { goals } = get()
        const now = new Date()

        // Calculate days for each step
        const shopDays = vehicle.shopStartDate
          ? Math.ceil((now.getTime() - new Date(vehicle.shopStartDate).getTime()) / (1000 * 60 * 60 * 24))
          : 0

        const detailDays = vehicle.detailStartDate
          ? Math.ceil((now.getTime() - new Date(vehicle.detailStartDate).getTime()) / (1000 * 60 * 60 * 24))
          : 0

        const photoDays = vehicle.photoStartDate
          ? Math.ceil((now.getTime() - new Date(vehicle.photoStartDate).getTime()) / (1000 * 60 * 60 * 24))
          : 0

        const totalDays = vehicle.arrivalDate
          ? Math.ceil((now.getTime() - new Date(vehicle.arrivalDate).getTime()) / (1000 * 60 * 60 * 24))
          : 0

        // Check each step
        const checks = [
          { step: "shop", days: shopDays, active: vehicle.status === "shop" },
          { step: "detail", days: detailDays, active: vehicle.status === "detail" },
          { step: "photo", days: photoDays, active: vehicle.status === "photo" },
          { step: "total", days: totalDays, active: vehicle.status !== "completed" },
        ]

        checks.forEach(({ step, days, active }) => {
          if (!active || days === 0) return

          const goal = goals[step as keyof TimelineGoals]
          const warningThreshold = Math.ceil((goal.target * goal.warning) / 100)

          let alertType: "warning" | "overdue" | null = null
          let message = ""

          if (days >= goal.target) {
            alertType = "overdue"
            message = `${step.charAt(0).toUpperCase() + step.slice(1)} step is ${
              days - goal.target
            } days overdue. Immediate attention required.`
          } else if (days >= warningThreshold) {
            alertType = "warning"
            message = `${step.charAt(0).toUpperCase() + step.slice(1)} step is approaching target deadline.`
          }

          if (alertType) {
            get().addAlert({
              vehicleId: vehicle.id,
              vehicleInfo: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
              vin: vehicle.vin,
              step,
              type: alertType,
              currentDays: days,
              targetDays: goal.target,
              message,
            })
          }
        })
      },
    }),
    {
      name: "timeline-store",
      partialize: (state) => ({
        goals: state.goals,
        alerts: state.alerts,
      }),
    },
  ),
)
