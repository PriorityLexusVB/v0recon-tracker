"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Loader2, TrendingUp } from "lucide-react"
import type { PerformanceTrend } from "@/lib/types" // Assuming this type is defined

interface PerformanceChartProps {
  data: PerformanceTrend[]
  loading: boolean
  error: string | null
  timeframe: "daily" | "weekly" | "monthly"
}

export function PerformanceChart({ data, loading, error, timeframe }: PerformanceChartProps) {
  if (loading) {
    return (
      <Card className="h-[400px] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-2">Loading performance trend...</p>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="h-[400px] flex items-center justify-center">
        <p className="text-red-600">{error}</p>
      </Card>
    )
  }

  if (!data || data.length === 0) {
    return (
      <Card className="h-[400px] flex items-center justify-center">
        <p className="text-gray-500">No performance trend data available for this timeframe.</p>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" /> Performance Trend ({timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}
          )
        </CardTitle>
        <CardDescription>Vehicles completed and average reconditioning time over time.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            vehiclesCompleted: {
              label: "Vehicles Completed",
              color: "hsl(var(--chart-1))",
            },
            avgReconTime: {
              label: "Avg. Recon Time (Days)",
              color: "hsl(var(--chart-2))",
            },
          }}
          className="h-[350px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis yAxisId="left" orientation="left" stroke="var(--color-vehiclesCompleted)" />
              <YAxis yAxisId="right" orientation="right" stroke="var(--color-avgReconTime)" />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="vehiclesCompleted"
                stroke="var(--color-vehiclesCompleted)"
                name="Vehicles Completed"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="avgReconTime"
                stroke="var(--color-avgReconTime)"
                name="Avg. Recon Time (Days)"
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
