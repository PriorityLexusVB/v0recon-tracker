"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Users, Clock, TrendingUp } from "lucide-react"

interface DepartmentMetric {
  department: string
  avgCompletionTime: number
  completionRate: number
  totalAssignments: number
}

interface DepartmentMetricsProps {
  data: DepartmentMetric[]
}

export function DepartmentMetrics({ data }: DepartmentMetricsProps) {
  const chartData = data.map((d) => ({
    name: d.department,
    "Avg Time": d.avgCompletionTime,
    "Completion Rate": d.completionRate,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Department Performance Metrics</CardTitle>
        <CardDescription>Average completion time and rate by department</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            "Avg Time": {
              label: "Avg. Completion Time (Days)",
              color: "hsl(var(--chart-1))",
            },
            "Completion Rate": {
              label: "Completion Rate (%)",
              color: "hsl(var(--chart-2))",
            },
          }}
          className="h-[350px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" orientation="left" stroke="var(--color-Avg-Time)" />
              <YAxis yAxisId="right" orientation="right" stroke="var(--color-Completion-Rate)" />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar yAxisId="left" dataKey="Avg Time" fill="var(--color-Avg-Time)" />
              <Bar yAxisId="right" dataKey="Completion Rate" fill="var(--color-Completion-Rate)" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {data.map((metric) => (
            <Card key={metric.department} className="p-4">
              <h3 className="font-semibold text-lg capitalize">{metric.department}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                <Clock className="h-4 w-4" />
                <span>Avg Time: {metric.avgCompletionTime.toFixed(1)} days</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <TrendingUp className="h-4 w-4" />
                <span>Rate: {metric.completionRate.toFixed(1)}%</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="h-4 w-4" />
                <span>Assignments: {metric.totalAssignments}</span>
              </div>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
