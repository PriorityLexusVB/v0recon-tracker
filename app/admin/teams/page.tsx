"use client"

import type React from "react"

import { useState, useEffect, useTransition } from "react"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Loader2, Plus, Search, Edit, Trash, ChevronLeft, ChevronRight, Users } from "lucide-react"
import { toast } from "sonner"
import { fetchTeams, createTeam, updateTeam, deleteTeam } from "@/app/actions/teams"
import type { Team } from "@/lib/types" // Assuming you have this type defined

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [isPending, startTransition] = useTransition()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTeam, setEditingTeam] = useState<Team | null>(null)
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({})
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const limit = 10 // Items per page

  useEffect(() => {
    loadTeams()
  }, [searchQuery, currentPage])

  const loadTeams = async () => {
    setLoading(true)
    try {
      const { teams, totalPages } = await fetchTeams(searchQuery, currentPage, limit)
      setTeams(teams)
      setTotalPages(totalPages)
    } catch (error) {
      toast.error("Failed to load teams.")
      console.error("Error loading teams:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddTeamClick = () => {
    setEditingTeam(null)
    setFormErrors({})
    setIsDialogOpen(true)
  }

  const handleEditTeamClick = (team: Team) => {
    setEditingTeam(team)
    setFormErrors({})
    setIsDialogOpen(true)
  }

  const handleDeleteTeam = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this team? This will unassign all members.")) {
      return
    }
    startTransition(async () => {
      try {
        await deleteTeam(id)
        toast.success("Team deleted successfully.")
        loadTeams()
      } catch (error) {
        toast.error("Failed to delete team.")
        console.error("Error deleting team:", error)
      }
    })
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    setFormErrors({})

    startTransition(async () => {
      let result
      if (editingTeam) {
        formData.append("id", editingTeam.id)
        result = await updateTeam(formData)
      } else {
        result = await createTeam(formData)
      }

      if (result.success) {
        toast.success(result.message)
        setIsDialogOpen(false)
        loadTeams()
      } else {
        setFormErrors(result.errors || { general: [result.message || "An unknown error occurred."] })
        toast.error(result.message || "Failed to save team.")
      }
    })
  }

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Team Management</h1>
        <Button onClick={handleAddTeamClick}>
          <Plus className="mr-2 h-4 w-4" />
          Add Team
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search teams by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-2 border rounded-md w-full"
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Members</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                  <p className="mt-2">Loading teams...</p>
                </TableCell>
              </TableRow>
            ) : teams.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  No teams found.
                </TableCell>
              </TableRow>
            ) : (
              teams.map((team) => (
                <TableRow key={team.id}>
                  <TableCell className="font-medium">{team.name}</TableCell>
                  <TableCell>{team.description || "N/A"}</TableCell>
                  <TableCell className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    {team.members?.length || 0}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleEditTeamClick(team)} className="mr-2">
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteTeam(team.id)} disabled={isPending}>
                      {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash className="h-4 w-4" />}
                      <span className="sr-only">Delete</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-between items-center mt-6">
        <Button
          variant="outline"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1 || loading || isPending}
        >
          <ChevronLeft className="h-4 w-4 mr-2" /> Previous
        </Button>
        <span className="text-sm text-gray-600">
          Page {currentPage} of {totalPages}
        </span>
        <Button
          variant="outline"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages || loading || isPending}
        >
          Next <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingTeam ? "Edit Team" : "Add New Team"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input id="name" name="name" defaultValue={editingTeam?.name || ""} className="col-span-3" required />
              {formErrors.name && <p className="col-span-4 text-right text-red-500 text-sm">{formErrors.name[0]}</p>}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Input
                id="description"
                name="description"
                defaultValue={editingTeam?.description || ""}
                className="col-span-3"
              />
              {formErrors.description && (
                <p className="col-span-4 text-right text-red-500 text-sm">{formErrors.description[0]}</p>
              )}
            </div>
            {formErrors.general && (
              <p className="col-span-4 text-center text-red-500 text-sm">{formErrors.general[0]}</p>
            )}
            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
