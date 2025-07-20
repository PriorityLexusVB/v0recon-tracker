import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { getDefaultEmailPreferences } from "./email-service" // Import the default email preferences

export interface NotificationPreference {
  browser: {
    enabled: boolean
    sound: boolean
  }
  email: {
    enabled: boolean
    recipientEmail: string
    recipientName: string
    serviceId: string
    templateId: string
    publicKey: string
  }
  webhook: {
    enabled: boolean
    url: string
  }
  escalation: {
    enabled: boolean
    managerEmail: string
    escalationDelayMinutes: number
  }
  quietHours: {
    enabled: boolean
    start: string // e.g., "22:00"
    end: string // e.g., "08:00"
  }
}

interface NotificationStore {
  preferences: NotificationPreference
  setPreference: (category: keyof NotificationPreference, key: string, value: any) => void
  resetPreferences: () => void
  isDuringQuietHours: () => boolean
}

const initialPreferences: NotificationPreference = {
  browser: {
    enabled: true,
    sound: true,
  },
  email: getDefaultEmailPreferences(), // Use the function to get initial email preferences
  webhook: {
    enabled: false,
    url: "",
  },
  escalation: {
    enabled: false,
    managerEmail: "",
    escalationDelayMinutes: 30,
  },
  quietHours: {
    enabled: false,
    start: "22:00",
    end: "08:00",
  },
}

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set, get) => ({
      preferences: initialPreferences,
      setPreference: (category, key, value) =>
        set((state) => ({
          preferences: {
            ...state.preferences,
            [category]: {
              ...state.preferences[category],
              [key]: value,
            },
          },
        })),
      resetPreferences: () => set({ preferences: initialPreferences }),
      isDuringQuietHours: () => {
        const { enabled, start, end } = get().preferences.quietHours
        if (!enabled) return false

        const now = new Date()
        const currentHour = now.getHours()
        const currentMinute = now.getMinutes()
        const currentTimeInMinutes = currentHour * 60 + currentMinute

        const [startHour, startMinute] = start.split(":").map(Number)
        const [endHour, endMinute] = end.split(":").map(Number)

        const startTimeInMinutes = startHour * 60 + startMinute
        const endTimeInMinutes = endHour * 60 + endMinute

        if (startTimeInMinutes < endTimeInMinutes) {
          // Quiet hours are within the same day (e.g., 22:00 to 08:00)
          return currentTimeInMinutes >= startTimeInMinutes && currentTimeInMinutes < endTimeInMinutes
        } else {
          // Quiet hours span across midnight (e.g., 22:00 to 08:00 next day)
          return currentTimeInMinutes >= startTimeInMinutes || currentTimeInMinutes < endTimeInMinutes
        }
      },
    }),
    {
      name: "notification-preferences", // name of the item in local storage
      storage: createJSONStorage(() => localStorage), // use localStorage
    },
  ),
)
