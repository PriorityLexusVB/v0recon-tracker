"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import bcryptjs from "bcryptjs"

export async function getUsers() {
  try {
    const session = await auth()

    if (!session || session.user.role !== "ADMIN") {
      return { success: false, error: "Admin access required" }
    }

    const users = await prisma.user.findMany({
      include: {
        teamMemberships: {
          where: {
            isActive: true,
          },
          include: {
            team: {
              select: {
                id: true,
                name: true,
                department: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    const formattedUsers = users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      isActive: true, // You might want to add this field to your schema
      createdAt: user.createdAt.toISOString(),
      team: user.teamMemberships[0]?.team || null,
    }))

    return { success: true, users: formattedUsers }
  } catch (error) {
    console.error("Error fetching users:", error)
    return { success: false, error: "Failed to fetch users" }
  }
}

export async function createUser(formData: FormData) {
  try {
    const session = await auth()

    if (!session || session.user.role !== "ADMIN") {
      return { success: false, error: "Admin access required" }
    }

    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const role = formData.get("role") as string
    const department = formData.get("department") as string
    const password = (formData.get("password") as string) || "TempPassword123!"

    if (!name || !email || !role) {
      return { success: false, error: "Name, email, and role are required" }
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return { success: false, error: "User with this email already exists" }
    }

    // Hash the password
    const hashedPassword = await bcryptjs.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role as any,
        department: department || null,
      },
    })

    revalidatePath("/admin/users")
    return { success: true, user: { ...user, password: undefined } }
  } catch (error) {
    console.error("Error creating user:", error)
    return { success: false, error: "Failed to create user" }
  }
}

export async function updateUser(userId: string, formData: FormData) {
  try {
    const session = await auth()

    if (!session || session.user.role !== "ADMIN") {
      return { success: false, error: "Admin access required" }
    }

    const name = formData.get("name") as string
    const role = formData.get("role") as string
    const department = formData.get("department") as string

    if (!name || !role) {
      return { success: false, error: "Name and role are required" }
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        role: role as any,
        department: department || null,
        updatedAt: new Date(),
      },
    })

    revalidatePath("/admin/users")
    return { success: true, user }
  } catch (error) {
    console.error("Error updating user:", error)
    return { success: false, error: "Failed to update user" }
  }
}

export async function deleteUser(userId: string) {
  try {
    const session = await auth()

    if (!session || session.user.role !== "ADMIN") {
      return { success: false, error: "Admin access required" }
    }

    // Don't allow deleting the current user
    if (userId === session.user.id) {
      return { success: false, error: "Cannot delete your own account" }
    }

    // Check if user has active assignments
    const activeAssignments = await prisma.vehicleAssignment.count({
      where: {
        assignedToUserId: userId,
        isActive: true,
      },
    })

    if (activeAssignments > 0) {
      return { success: false, error: "Cannot delete user with active vehicle assignments" }
    }

    await prisma.user.delete({
      where: { id: userId },
    })

    revalidatePath("/admin/users")
    return { success: true }
  } catch (error) {
    console.error("Error deleting user:", error)
    return { success: false, error: "Failed to delete user" }
  }
}

export async function updateUserProfile(formData: FormData) {
  try {
    const session = await auth()

    if (!session) {
      return { success: false, error: "Authentication required" }
    }

    const name = formData.get("name") as string
    const department = formData.get("department") as string
    const bio = formData.get("bio") as string
    const phone = formData.get("phone") as string

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: name || undefined,
        department: department || null,
        // Note: bio and phone would need to be added to your schema
        updatedAt: new Date(),
      },
    })

    revalidatePath("/settings")
    return { success: true, user }
  } catch (error) {
    console.error("Error updating profile:", error)
    return { success: false, error: "Failed to update profile" }
  }
}
