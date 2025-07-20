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
import { Users, Plus, Settings, UserPlus, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { getTeams, createTeam } from "@/app/actions/teams"

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

  useEffect(() => {
    loadTeams()
  }, [])

  const loadTeams = async () => {
    setIsLoadingTeams(true)
    try {
      const result = await getTeams()
      if (result.success) {
        setTeams(result.teams)
      } else {
        toast.error(result.error || "Failed to load teams")
      }
    } catch (error) {
      console.error("Error loading teams:", error)
      toast.error("Failed to load teams")
    } finally {
      setIsLoadingTeams(false)
    }
  }

  const handleCreateTeam = (formData: FormData) => {
    startTransition(async () => {
      try {
        const result = await createTeam(formData)
        if (result.success) {
          toast.success("Team created successfully")
          setIsCreateDialogOpen(false)
          loadTeams() // Refresh the teams list
        } else {
          toast.error(result.error || "Failed to create team")
        }
      } catch (error) {
        console.error("Error creating team:", error)
        toast.error("Failed to create team")
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
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Team"
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoadingTeams ? (
          <div className="col-span-full text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p>Loading teams...</p>
          </div>
        ) : teams.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No teams created yet.</p>
            <p className="text-sm text-gray-400">Create your first team to get started.</p>
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
                    <Button variant="outline" size="sm" title="Add User">
                      <UserPlus className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" title="Team Settings">
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
