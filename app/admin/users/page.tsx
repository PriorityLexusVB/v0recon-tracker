"use client"

import type React from "react"

import { useState, useEffect, useTransition } from "react"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Plus, Search, Edit, Trash, ChevronLeft, ChevronRight } from "lucide-react"
import { toast } from "sonner"
import { fetchUsers, createUser, updateUser, deleteUser } from "@/app/actions/users"
import { fetchTeams } from "@/app/actions/teams"
import type { User, Team } from "@/lib/types" // Assuming you have these types defined

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [isPending, startTransition] = useTransition()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({})
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const limit = 10 // Items per page

  useEffect(() => {
    loadUsers()
    loadTeams()
  }, [searchQuery, currentPage])

  const loadUsers = async () => {
    setLoading(true)
    try {
      const { users, totalPages } = await fetchUsers(searchQuery, currentPage, limit)
      setUsers(users)
      setTotalPages(totalPages)
    } catch (error) {
      toast.error("Failed to load users.")
      console.error("Error loading users:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadTeams = async () => {
    try {
      const { teams } = await fetchTeams("", 1, 100) // Fetch all teams for selection
      setTeams(teams)
    } catch (error) {
      toast.error("Failed to load teams for selection.")
      console.error("Error loading teams:", error)
    }
  }

  const handleAddUserClick = () => {
    setEditingUser(null)
    setFormErrors({})
    setIsDialogOpen(true)
  }

  const handleEditUserClick = (user: User) => {
    setEditingUser(user)
    setFormErrors({})
    setIsDialogOpen(true)
  }

  const handleDeleteUser = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this user?")) {
      return
    }
    startTransition(async () => {
      try {
        await deleteUser(id)
        toast.success("User deleted successfully.")
        loadUsers()
      } catch (error) {
        toast.error("Failed to delete user.")
        console.error("Error deleting user:", error)
      }
    })
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    setFormErrors({})

    startTransition(async () => {
      let result
      if (editingUser) {
        formData.append("id", editingUser.id)
        result = await updateUser(formData)
      } else {
        result = await createUser(formData)
      }

      if (result.success) {
        toast.success(result.message)
        setIsDialogOpen(false)
        loadUsers()
      } else {
        setFormErrors(result.errors || { general: [result.message || "An unknown error occurred."] })
        toast.error(result.message || "Failed to save user.")
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
        <h1 className="text-3xl font-bold">User Management</h1>
        <Button onClick={handleAddUserClick}>
          <Plus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search users by name or email..."
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
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Team</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                  <p className="mt-2">Loading users...</p>
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>{user.status}</TableCell>
                  <TableCell>{user.team?.name || "N/A"}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleEditUserClick(user)} className="mr-2">
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteUser(user.id)} disabled={isPending}>
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
            <DialogTitle>{editingUser ? "Edit User" : "Add New User"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input id="name" name="name" defaultValue={editingUser?.name || ""} className="col-span-3" required />
              {formErrors.name && <p className="col-span-4 text-right text-red-500 text-sm">{formErrors.name[0]}</p>}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={editingUser?.email || ""}
                className="col-span-3"
                required
              />
              {formErrors.email && <p className="col-span-4 text-right text-red-500 text-sm">{formErrors.email[0]}</p>}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder={editingUser ? "Leave blank to keep current" : "Enter password"}
                className="col-span-3"
                required={!editingUser}
              />
              {formErrors.password && (
                <p className="col-span-4 text-right text-red-500 text-sm">{formErrors.password[0]}</p>
              )}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Role
              </Label>
              <Select
                name="role"
                defaultValue={editingUser?.role || "USER"}
                onValueChange={(value) => {
                  // This is a controlled component, but we need to ensure the form data gets it
                  // For simplicity, we'll let the form submit handle it, or you can manage state
                }}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">User</SelectItem>
                  <SelectItem value="MANAGER">Manager</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
              {formErrors.role && <p className="col-span-4 text-right text-red-500 text-sm">{formErrors.role[0]}</p>}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <Select name="status" defaultValue={editingUser?.status || "ACTIVE"} onValueChange={(value) => {}}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                </SelectContent>
              </Select>
              {formErrors.status && (
                <p className="col-span-4 text-right text-red-500 text-sm">{formErrors.status[0]}</p>
              )}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="teamId" className="text-right">
                Team
              </Label>
              <Select name="teamId" defaultValue={editingUser?.teamId || "none"} onValueChange={(value) => {}}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a team (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.teamId && (
                <p className="col-span-4 text-right text-red-500 text-sm">{formErrors.teamId[0]}</p>
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
