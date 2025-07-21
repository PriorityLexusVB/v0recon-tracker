"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface PerformanceData {
  name: string
  completed: number
  inProgress: number
  overdue: number
}

interface PerformanceChartProps {
  data: PerformanceData[]
}

export function PerformanceChart({ data }: PerformanceChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Assignment Status Overview</CardTitle>
        <CardDescription>Breakdown of vehicle assignments by status</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            completed: {
              label: "Completed",
              color: "hsl(var(--chart-1))",
            },
            inProgress: {
              label: "In Progress",
              color: "hsl(var(--chart-2))",
            },
            overdue: {
              label: "Overdue",
              color: "hsl(var(--chart-3))",
            },
          }}
          className="h-[350px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="completed" fill="var(--color-completed)" name="Completed" />
              <Bar dataKey="inProgress" fill="var(--color-inProgress)" name="In Progress" />
              <Bar dataKey="overdue" fill="var(--color-overdue)" name="Overdue" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
