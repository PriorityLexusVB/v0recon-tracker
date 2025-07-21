"use client"

// This file could be used for client-side state management for timeline events
// For example, using Zustand or React Context to manage timeline data
// and real-time updates.

import { useState, useEffect, useCallback } from "react"
import type { TimelineEvent, User, Vehicle } from "@prisma/client" // Import Prisma's generated types
import { fetchTimelineEvents } from "@/app/actions/vehicles" // Assuming this action exists

// Extend Prisma's TimelineEvent type to include relations if needed for client-side display
export interface TimelineEventWithRelations extends TimelineEvent {
  user?: User | null
  vehicle?: Vehicle | null
}

interface TimelineStore {
  timelineEvents: TimelineEventWithRelations[]
  loading: boolean
  error: string | null
  fetchTimelineEvents: (
    vehicleId?: string,
    userId?: string,
    eventType?: string,
    page?: number,
    limit?: number,
  ) => Promise<void>
  totalPages: number
  currentPage: number
}

export function useTimelineStore(): TimelineStore {
  const [timelineEvents, setTimelineEvents] = useState<TimelineEventWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalPages, setTotalPages] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)

  const fetchEvents = useCallback(
    async (vehicleId?: string, userId?: string, eventType?: string, page = 1, limit = 10) => {
      setLoading(true)
      setError(null)
      try {
        const result = await fetchTimelineEvents(vehicleId, userId, eventType, page, limit)
        if (result.success) {
          setTimelineEvents(result.events)
          setTotalPages(result.totalPages)
          setCurrentPage(result.currentPage)
        } else {
          setError(result.message || "Failed to fetch timeline events.")
        }
      } catch (err) {
        setError("Failed to fetch timeline events.")
        console.error("Error fetching timeline events:", err)
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  // Initial load or when dependencies change
  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  return {
    timelineEvents,
    loading,
    error,
    fetchTimelineEvents: fetchEvents,
    totalPages,
    currentPage,
  }
}
