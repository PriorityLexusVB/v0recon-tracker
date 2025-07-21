"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Loader2, ArrowRight, CheckCircle } from "lucide-react"
import Link from "next/link"
import { getOverdueAssignments } from "@/app/actions/assignments"
import { toast } from "sonner"

interface OverdueAssignment {
  id: string
  vehicle: {
    vin: string
    stock: string
    make: string
    model: string
    year: number
  }
  team: {
    name: string
  }
  dueDate: Date
  daysOverdue: number
}

export function TimelineAlertsPanel() {
  const [overdueAssignments, setOverdueAssignments] = useState<OverdueAssignment[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchOverdueAssignments()
  }, [])

  const fetchOverdueAssignments = async () => {
    setIsLoading(true)
    try {
      const data = await getOverdueAssignments()
      setOverdueAssignments(data)
    } catch (error) {
      console.error("Failed to fetch overdue assignments:", error)
      toast.error("Failed to load overdue assignments.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-lg">Overdue Assignments</CardTitle>
          <CardDescription>Assignments past their due date</CardDescription>
        </div>
        <AlertTriangle className="h-5 w-5 text-red-500" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
            <p className="ml-2 text-gray-600">Loading...</p>
          </div>
        ) : overdueAssignments.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
            <p className="text-gray-600">No overdue assignments! Great job!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Overdue By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {overdueAssignments.slice(0, 5).map((assignment) => (
                  <TableRow key={assignment.id}>
                    <TableCell className="font-medium">
                      {assignment.vehicle.year} {assignment.vehicle.make} {assignment.vehicle.model}
                    </TableCell>
                    <TableCell>{assignment.team.name}</TableCell>
                    <TableCell>{new Date(assignment.dueDate).toLocaleDateString()}</TableCell>
                    <TableCell className="text-red-600">{assignment.daysOverdue} days</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        <div className="mt-4 text-right">
          <Button variant="link" asChild>
            <Link href="/admin/assignments?status=overdue">
              View All Overdue <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
