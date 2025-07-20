"use client"

import { useEffect, useState, useTransition } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Car, Plus, Calendar, User } from "lucide-react"

interface VehicleAssignment {
  id: string
  vin: string
  status: string
  priority: string
  dueDate?: string
  notes?: string
  team: {
    id: string
    name: string
    department: string
  }
  user?: {
    id: string
    name?: string
    email: string
  }
}

interface Team {
  id: string
  name: string
  department: string
  users: Array<{
    id: string
    name?: string
    email: string
  }>
}

export default function AssignmentsPage() {
  const { user, isLoading } = useAuth()
  const [assignments, setAssignments] = useState<VehicleAssignment[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState<string>("")
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingData(true)
      // Mock data for demo
      const mockAssignments: VehicleAssignment[] = [
        {
          id: "1",
          vin: "1HGBH41JXMN109186",
          status: "in_progress",
          priority: "high",
          dueDate: "2024-01-20",
          notes: "Rush job for customer",
          team: { id: "1", name: "Shop Team A", department: "shop" },
          user: { id: "1", name: "John Smith", email: "john@example.com" },
        },
        {
          id: "2",
          vin: "1FTFW1ET5DFC10312",
          status: "assigned",
          priority: "normal",
          team: { id: "2", name: "Detail Team", department: "detail" },
        },
      ]

      const mockTeams: Team[] = [
        {
          id: "1",
          name: "Shop Team A",
          department: "shop",
          users: [
            { id: "1", name: "John Smith", email: "john@example.com" },
            { id: "2", name: "Jane Doe", email: "jane@example.com" },
          ],
        },
        {
          id: "2",
          name: "Detail Team",
          department: "detail",
          users: [{ id: "3", name: "Mike Johnson", email: "mike@example.com" }],
        },
      ]

      setAssignments(mockAssignments)
      setTeams(mockTeams)
      setIsLoadingData(false)
    }

    fetchData()
  }, [])

  const handleAssignVehicle = (formData: FormData) => {
    startTransition(() => {
      const vin = formData.get("vin") as string
      const teamId = formData.get("teamId") as string
      const userId = formData.get("userId") as string
      const priority = formData.get("priority") as string
      const dueDate = formData.get("dueDate") as string
      const notes = formData.get("notes") as string

      const team = teams.find((t) => t.id === teamId)
      const assignedUser = team?.users.find((u) => u.id === userId)

      const newAssignment: VehicleAssignment = {
        id: Date.now().toString(),
        vin,
        status: "assigned",
        priority,
        dueDate: dueDate || undefined,
        notes: notes || undefined,
        team: team!,
        user: assignedUser,
      }

      setAssignments((prev) => [...prev, newAssignment])
      setMessage("Vehicle assigned successfully")
      setIsAssignDialogOpen(false)
      setSelectedTeam("")
    })
  }

  if (isLoading) {
    return <div className="container mx-auto py-8">Loading...</div>
  }

  if (user?.role !== "ADMIN" && user?.role !== "MANAGER") {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-red-600">Access denied. Admin or Manager privileges required.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800"
      case "high":
        return "bg-orange-100 text-orange-800"
      case "normal":
        return "bg-blue-100 text-blue-800"
      case "low":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "in_progress":
        return "bg-yellow-100 text-yellow-800"
      case "assigned":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const selectedTeamUsers = teams.find((t) => t.id === selectedTeam)?.users || []

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Vehicle Assignments</h1>
          <p className="text-gray-600">Assign vehicles to teams and track progress</p>
        </div>
        <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Assign Vehicle
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Vehicle to Team</DialogTitle>
              <DialogDescription>Assign a vehicle to a team for processing.</DialogDescription>
            </DialogHeader>
            <form action={handleAssignVehicle} className="space-y-4">
              <div>
                <Label htmlFor="vin">VIN</Label>
                <Input id="vin" name="vin" placeholder="Enter vehicle VIN" required />
              </div>
              <div>
                <Label htmlFor="teamId">Team</Label>
                <Select name="teamId" value={selectedTeam} onValueChange={setSelectedTeam} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select team" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name} ({team.department})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {selectedTeam && selectedTeamUsers.length > 0 && (
                <div>
                  <Label htmlFor="userId">Assign to User (Optional)</Label>
                  <Select name="userId">
                    <SelectTrigger>
                      <SelectValue placeholder="Select user (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedTeamUsers.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name || user.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select name="priority" defaultValue="normal">
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="dueDate">Due Date (Optional)</Label>
                <Input id="dueDate" name="dueDate" type="date" />
              </div>
              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea id="notes" name="notes" placeholder="Enter any notes" />
              </div>
              {message && message !== "Vehicle assigned successfully" && (
                <p className="text-sm text-red-600">{message}</p>
              )}
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Assigning..." : "Assign Vehicle"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Assignments Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            Vehicle Assignments
          </CardTitle>
          <CardDescription>Track vehicle assignments and their progress</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingData ? (
            <div className="text-center py-8">Loading assignments...</div>
          ) : assignments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No vehicle assignments yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>VIN</TableHead>
                    <TableHead>Team</TableHead>
                    <TableHead>Assigned User</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignments.map((assignment) => (
                    <TableRow key={assignment.id}>
                      <TableCell className="font-mono text-sm">{assignment.vin}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{assignment.team.name}</span>
                          <span className="text-sm text-gray-500">{assignment.team.department}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {assignment.user ? (
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>{assignment.user.name || assignment.user.email}</span>
                          </div>
                        ) : (
                          <span className="text-gray-500">Unassigned</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeColor(assignment.status)}>
                          {assignment.status.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPriorityBadgeColor(assignment.priority)}>{assignment.priority}</Badge>
                      </TableCell>
                      <TableCell>
                        {assignment.dueDate ? (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(assignment.dueDate).toLocaleDateString()}</span>
                          </div>
                        ) : (
                          <span className="text-gray-500">No due date</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {assignment.notes ? (
                          <span className="text-sm">{assignment.notes}</span>
                        ) : (
                          <span className="text-gray-500">No notes</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assignment Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assignments.length}</div>
            <p className="text-xs text-muted-foreground">Active assignments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assignments.filter((a) => a.status === "in_progress").length}</div>
            <p className="text-xs text-muted-foreground">Currently being worked on</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assignments.filter((a) => a.status === "completed").length}</div>
            <p className="text-xs text-muted-foreground">Finished assignments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Urgent Priority</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assignments.filter((a) => a.priority === "urgent").length}</div>
            <p className="text-xs text-muted-foreground">High priority items</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
