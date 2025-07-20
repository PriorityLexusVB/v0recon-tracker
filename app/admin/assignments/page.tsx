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
import { Car, Plus, Calendar, User, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { getAssignments, createAssignment } from "@/app/actions/assignments"
import { getTeams } from "@/app/actions/teams"

interface VehicleAssignment {
  id: string
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
  vehicle: {
    id: string
    vin: string
    make: string
    model: string
    year: number
    status: string
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

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoadingData(true)
    try {
      const [assignmentsResult, teamsResult] = await Promise.all([getAssignments(), getTeams()])

      if (assignmentsResult.success) {
        setAssignments(assignmentsResult.assignments)
      } else {
        toast.error(assignmentsResult.error || "Failed to load assignments")
      }

      if (teamsResult.success) {
        setTeams(teamsResult.teams)
      } else {
        toast.error(teamsResult.error || "Failed to load teams")
      }
    } catch (error) {
      console.error("Error loading data:", error)
      toast.error("Failed to load data")
    } finally {
      setIsLoadingData(false)
    }
  }

  const handleAssignVehicle = (formData: FormData) => {
    startTransition(async () => {
      try {
        const result = await createAssignment(formData)
        if (result.success) {
          toast.success("Vehicle assigned successfully")
          setIsAssignDialogOpen(false)
          setSelectedTeam("")
          loadData() // Refresh the data
        } else {
          toast.error(result.error || "Failed to assign vehicle")
        }
      } catch (error) {
        console.error("Error assigning vehicle:", error)
        toast.error("Failed to assign vehicle")
      }
    })
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
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
      case "URGENT":
        return "bg-red-100 text-red-800"
      case "HIGH":
        return "bg-orange-100 text-orange-800"
      case "NORMAL":
        return "bg-blue-100 text-blue-800"
      case "LOW":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800"
      case "IN_PROGRESS":
        return "bg-yellow-100 text-yellow-800"
      case "ASSIGNED":
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
                <Select name="priority" defaultValue="NORMAL">
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="NORMAL">Normal</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="URGENT">Urgent</SelectItem>
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
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Assigning...
                    </>
                  ) : (
                    "Assign Vehicle"
                  )}
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
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
              <p>Loading assignments...</p>
            </div>
          ) : assignments.length === 0 ? (
            <div className="text-center py-8">
              <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No vehicle assignments yet.</p>
              <p className="text-sm text-gray-400">Create your first assignment to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vehicle</TableHead>
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
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {assignment.vehicle.year} {assignment.vehicle.make} {assignment.vehicle.model}
                          </span>
                          <span className="text-sm text-gray-500">Status: {assignment.vehicle.status}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{assignment.vehicle.vin}</TableCell>
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
            <div className="text-2xl font-bold">{assignments.filter((a) => a.status === "IN_PROGRESS").length}</div>
            <p className="text-xs text-muted-foreground">Currently being worked on</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assignments.filter((a) => a.status === "COMPLETED").length}</div>
            <p className="text-xs text-muted-foreground">Finished assignments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Urgent Priority</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assignments.filter((a) => a.priority === "URGENT").length}</div>
            <p className="text-xs text-muted-foreground">High priority items</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
