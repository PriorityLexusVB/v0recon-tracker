"use client"

import { Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface TrendChartProps {
  data: {
    month: string
    completed: number
    started: number
    overdue: number
  }[]
}

export default function TrendChart({ data }: TrendChartProps) {
  return (
    <ChartContainer
      config={{
        completed: {
          label: "Completed",
          color: "hsl(var(--chart-1))",
        },
        started: {
          label: "Started",
          color: "hsl(var(--chart-2))",
        },
        overdue: {
          label: "Overdue",
          color: "hsl(var(--chart-3))",
        },
      }}
      className="h-[300px]"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis fontSize={12} tickLine={false} axisLine={false} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Legend />
          <Bar dataKey="completed" fill="var(--color-completed)" name="Completed" />
          <Bar dataKey="started" fill="var(--color-started)" name="Started" />
          <Bar dataKey="overdue" fill="var(--color-overdue)" name="Overdue" />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
