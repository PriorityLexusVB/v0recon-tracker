"use client"

// This file could be used for client-side state management for analytics data
// For example, using Zustand or React Context to manage dashboard data,
// filtering, and refreshing.

import { useState, useEffect, useCallback } from "react"
import {
  fetchOverallAnalytics,
  fetchDepartmentMetrics,
  fetchPerformanceTrend,
  fetchTeamPerformance,
} from "@/app/actions/analytics" // Import server actions
import type { OverallAnalytics, DepartmentMetrics, PerformanceTrend, TeamPerformanceData } from "@/lib/types" // Assuming these types are defined

interface AnalyticsStore {
  overallAnalytics: OverallAnalytics | null
  departmentMetrics: DepartmentMetrics[]
  performanceTrend: PerformanceTrend[]
  teamPerformance: TeamPerformanceData | null
  loadingOverall: boolean
  loadingDepartments: boolean
  loadingTrend: boolean
  loadingTeamPerformance: boolean
  errorOverall: string | null
  errorDepartments: string | null
  errorTrend: string | null
  errorTeamPerformance: string | null
  fetchOverall: () => Promise<void>
  fetchDepartments: () => Promise<void>
  fetchTrend: (timeframe?: "daily" | "weekly" | "monthly") => Promise<void>
  fetchTeamPerformanceData: (teamId: string) => Promise<void>
}

export function useAnalyticsStore(): AnalyticsStore {
  const [overallAnalytics, setOverallAnalytics] = useState<OverallAnalytics | null>(null)
  const [departmentMetrics, setDepartmentMetrics] = useState<DepartmentMetrics[]>([])
  const [performanceTrend, setPerformanceTrend] = useState<PerformanceTrend[]>([])
  const [teamPerformance, setTeamPerformance] = useState<TeamPerformanceData | null>(null)

  const [loadingOverall, setLoadingOverall] = useState(true)
  const [loadingDepartments, setLoadingDepartments] = useState(true)
  const [loadingTrend, setLoadingTrend] = useState(true)
  const [loadingTeamPerformance, setLoadingTeamPerformance] = useState(true)

  const [errorOverall, setErrorOverall] = useState<string | null>(null)
  const [errorDepartments, setErrorDepartments] = useState<string | null>(null)
  const [errorTrend, setErrorTrend] = useState<string | null>(null)
  const [errorTeamPerformance, setErrorTeamPerformance] = useState<string | null>(null)

  const fetchOverall = useCallback(async () => {
    setLoadingOverall(true)
    setErrorOverall(null)
    try {
      const result = await fetchOverallAnalytics()
      if (result.success) {
        setOverallAnalytics(result.data)
      } else {
        setErrorOverall(result.message || "Failed to fetch overall analytics.")
      }
    } catch (err) {
      setErrorOverall("Failed to fetch overall analytics.")
      console.error("Error fetching overall analytics:", err)
    } finally {
      setLoadingOverall(false)
    }
  }, [])

  const fetchDepartments = useCallback(async () => {
    setLoadingDepartments(true)
    setErrorDepartments(null)
    try {
      const result = await fetchDepartmentMetrics()
      if (result.success) {
        setDepartmentMetrics(result.data)
      } else {
        setErrorDepartments(result.message || "Failed to fetch department metrics.")
      }
    } catch (err) {
      setErrorDepartments("Failed to fetch department metrics.")
      console.error("Error fetching department metrics:", err)
    } finally {
      setLoadingDepartments(false)
    }
  }, [])

  const fetchTrend = useCallback(async (timeframe: "daily" | "weekly" | "monthly" = "monthly") => {
    setLoadingTrend(true)
    setErrorTrend(null)
    try {
      const result = await fetchPerformanceTrend(timeframe)
      if (result.success) {
        setPerformanceTrend(result.data)
      } else {
        setErrorTrend(result.message || "Failed to fetch performance trend.")
      }
    } catch (err) {
      setErrorTrend("Failed to fetch performance trend.")
      console.error("Error fetching performance trend:", err)
    } finally {
      setLoadingTrend(false)
    }
  }, [])

  const fetchTeamPerformanceData = useCallback(async (teamId: string) => {
    setLoadingTeamPerformance(true)
    setErrorTeamPerformance(null)
    try {
      const result = await fetchTeamPerformance(teamId)
      if (result.success) {
        setTeamPerformance(result.data)
      } else {
        setErrorTeamPerformance(result.message || "Failed to fetch team performance.")
      }
    } catch (err) {
      setErrorTeamPerformance("Failed to fetch team performance.")
      console.error("Error fetching team performance:", err)
    } finally {
      setLoadingTeamPerformance(false)
    }
  }, [])

  useEffect(() => {
    fetchOverall()
    fetchDepartments()
    fetchTrend()
  }, [fetchOverall, fetchDepartments, fetchTrend])

  return {
    overallAnalytics,
    departmentMetrics,
    performanceTrend,
    teamPerformance,
    loadingOverall,
    loadingDepartments,
    loadingTrend,
    loadingTeamPerformance,
    errorOverall,
    errorDepartments,
    errorTrend,
    errorTeamPerformance,
    fetchOverall,
    fetchDepartments,
    fetchTrend,
    fetchTeamPerformanceData,
  }
}
