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
import { Users, Plus, Settings, UserPlus } from "lucide-react"

interface Team {
  id: string
  name: string
  description?: string
  department: string
  isActive: boolean
  users: Array<{
    id: string
    name?: string
    email: string
    role: string
  }>
  vehicleCount: number
}

export default function TeamsPage() {
  const { user, isLoading } = useAuth()
  const [teams, setTeams] = useState<Team[]>([])
  const [isLoadingTeams, setIsLoadingTeams] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState("")

  useEffect(() => {
    const fetchTeams = async () => {
      setIsLoadingTeams(true)
      // Mock data for demo
      const mockTeams: Team[] = [
        {
          id: "1",
          name: "Shop Team A",
          description: "Primary shop reconditioning team",
          department: "shop",
          isActive: true,
          users: [
            { id: "1", name: "John Smith", email: "john@example.com", role: "USER" },
            { id: "2", name: "Jane Doe", email: "jane@example.com", role: "USER" },
          ],
          vehicleCount: 15,
        },
        {
          id: "2",
          name: "Detail Team",
          description: "Vehicle detailing specialists",
          department: "detail",
          isActive: true,
          users: [{ id: "3", name: "Mike Johnson", email: "mike@example.com", role: "USER" }],
          vehicleCount: 8,
        },
      ]
      setTeams(mockTeams)
      setIsLoadingTeams(false)
    }

    fetchTeams()
  }, [])

  const handleCreateTeam = (formData: FormData) => {
    startTransition(() => {
      const name = formData.get("name") as string
      const description = formData.get("description") as string
      const department = formData.get("department") as string

      if (!name || !department) {
        setMessage("Name and department are required")
        return
      }

      const newTeam: Team = {
        id: Date.now().toString(),
        name,
        description: description || undefined,
        department,
        isActive: true,
        users: [],
        vehicleCount: 0,
      }

      setTeams((prev) => [...prev, newTeam])
      setMessage("Team created successfully")
      setIsCreateDialogOpen(false)
    })
  }

  useEffect(() => {
    if (message === "Team created successfully") {
      const timer = setTimeout(() => setMessage(""), 3000)
      return () => clearTimeout(timer)
    }
  }, [message])

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

  const getDepartmentBadgeColor = (department: string) => {
    switch (department) {
      case "shop":
        return "bg-blue-100 text-blue-800"
      case "detail":
        return "bg-green-100 text-green-800"
      case "photo":
        return "bg-purple-100 text-purple-800"
      case "sales":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Team Management</h1>
          <p className="text-gray-600">Manage teams and assign users</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Team
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Team</DialogTitle>
              <DialogDescription>Create a new team and assign users to it.</DialogDescription>
            </DialogHeader>
            <form action={handleCreateTeam} className="space-y-4">
              <div>
                <Label htmlFor="name">Team Name</Label>
                <Input id="name" name="name" placeholder="Enter team name" required />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" placeholder="Enter team description" />
              </div>
              <div>
                <Label htmlFor="department">Department</Label>
                <Select name="department" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="shop">Shop</SelectItem>
                    <SelectItem value="detail">Detail</SelectItem>
                    <SelectItem value="photo">Photo</SelectItem>
                    <SelectItem value="sales">Sales</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {message && message !== "Team created successfully" && <p className="text-sm text-red-600">{message}</p>}
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Creating..." : "Create Team"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoadingTeams ? (
          <div className="col-span-full text-center py-8">Loading teams...</div>
        ) : teams.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <p className="text-gray-500">No teams created yet.</p>
          </div>
        ) : (
          teams.map((team) => (
            <Card key={team.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{team.name}</CardTitle>
                  <Badge className={getDepartmentBadgeColor(team.department)}>{team.department}</Badge>
                </div>
                {team.description && <CardDescription>{team.description}</CardDescription>}
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      {team.users.length} members
                    </span>
                    <span className="text-gray-500">{team.vehicleCount} vehicles</span>
                  </div>

                  {team.users.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Team Members:</p>
                      <div className="space-y-1">
                        {team.users.slice(0, 3).map((member) => (
                          <div key={member.id} className="flex items-center justify-between text-sm">
                            <span>{member.name || member.email}</span>
                            <Badge variant="outline" className="text-xs">
                              {member.role}
                            </Badge>
                          </div>
                        ))}
                        {team.users.length > 3 && (
                          <p className="text-xs text-gray-500">+{team.users.length - 3} more members</p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" size="sm">
                      <UserPlus className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Team Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Teams</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teams.length}</div>
            <p className="text-xs text-muted-foreground">Active teams</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shop Teams</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teams.filter((t) => t.department === "shop").length}</div>
            <p className="text-xs text-muted-foreground">Shop department</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Detail Teams</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teams.filter((t) => t.department === "detail").length}</div>
            <p className="text-xs text-muted-foreground">Detail department</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Photo Teams</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teams.filter((t) => t.department === "photo").length}</div>
            <p className="text-xs text-muted-foreground">Photo department</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
