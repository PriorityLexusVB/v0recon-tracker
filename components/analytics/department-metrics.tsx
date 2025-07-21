"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Loader2, Building2 } from "lucide-react"
import type { DepartmentMetrics } from "@/lib/types" // Assuming this type is defined

interface DepartmentMetricsChartProps {
  data: DepartmentMetrics[]
  loading: boolean
  error: string | null
}

export function DepartmentMetricsChart({ data, loading, error }: DepartmentMetricsChartProps) {
  if (loading) {
    return (
      <Card className="h-[400px] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-2">Loading department metrics...</p>
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
        <p className="text-gray-500">No department metrics available.</p>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" /> Department Performance
        </CardTitle>
        <CardDescription>Vehicles processed and average time per department.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            vehiclesCount: {
              label: "Vehicles Count",
              color: "hsl(var(--chart-1))",
            },
            avgTimeInDepartment: {
              label: "Avg. Time (Days)",
              color: "hsl(var(--chart-2))",
            },
            completedCount: {
              label: "Completed Count",
              color: "hsl(var(--chart-3))",
            },
          }}
          className="h-[350px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="department" />
              <YAxis yAxisId="left" orientation="left" stroke="var(--color-vehiclesCount)" />
              <YAxis yAxisId="right" orientation="right" stroke="var(--color-avgTimeInDepartment)" />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Bar yAxisId="left" dataKey="vehiclesCount" fill="var(--color-vehiclesCount)" name="Vehicles Count" />
              <Bar
                yAxisId="right"
                dataKey="avgTimeInDepartment"
                fill="var(--color-avgTimeInDepartment)"
                name="Avg. Time (Days)"
              />
              <Bar yAxisId="left" dataKey="completedCount" fill="var(--color-completedCount)" name="Completed Count" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
