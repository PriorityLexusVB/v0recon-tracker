"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import bcrypt from "bcryptjs"

const userSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required."),
  email: z.string().email("Invalid email address."),
  password: z.string().min(6, "Password must be at least 6 characters.").optional().nullable(),
  role: z.enum(["USER", "MANAGER", "ADMIN"]),
  status: z.enum(["ACTIVE", "INACTIVE", "PENDING"]),
  teamId: z.string().optional().nullable(),
  department: z.string().optional().nullable(),
})

export async function fetchUsers(query = "", page = 1, limit = 10) {
  try {
    const offset = (page - 1) * limit
    const whereClause: any = {
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { email: { contains: query, mode: "insensitive" } },
        { department: { contains: query, mode: "insensitive" } },
      ],
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      include: {
        team: {
          select: { id: true, name: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: offset,
      take: limit,
    })

    const totalUsers = await prisma.user.count({ where: whereClause })

    revalidatePath("/admin/users")
    return { users, totalPages: Math.ceil(totalUsers / limit), currentPage: page, success: true }
  } catch (error) {
    console.error("Failed to fetch users:", error)
    return { users: [], totalPages: 0, currentPage: 1, success: false, message: "Failed to fetch users." }
  }
}

export async function fetchUsersForSelect() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: {
        name: "asc",
      },
    })
    return { users, success: true }
  } catch (error) {
    console.error("Failed to fetch users for select:", error)
    return { users: [], success: false, message: "Failed to fetch users for selection." }
  }
}

export async function createUser(formData: FormData) {
  const data = Object.fromEntries(formData.entries())
  const parsed = userSchema.safeParse(data)

  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors, message: "Validation failed." }
  }

  const { name, email, password, role, status, teamId, department } = parsed.data

  if (!password) {
    return {
      success: false,
      errors: { password: ["Password is required for new users."] },
      message: "Password is required.",
    }
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return {
        success: false,
        message: "User with this email already exists.",
        errors: { email: ["Email already in use."] },
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        status,
        teamId: teamId === "none" ? null : teamId,
        department,
      },
    })

    revalidatePath("/admin/users")
    return { success: true, message: "User created successfully.", user: newUser }
  } catch (error) {
    console.error("Failed to create user:", error)
    return { success: false, message: "Failed to create user." }
  }
}

export async function updateUser(formData: FormData) {
  const data = Object.fromEntries(formData.entries())
  const parsed = userSchema
    .partial()
    .extend({ id: z.string().min(1, "User ID is required.") })
    .safeParse(data)

  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors, message: "Validation failed." }
  }

  const { id, password, teamId, ...updateData } = parsed.data

  try {
    const existingUser = await prisma.user.findUnique({ where: { id } })
    if (!existingUser) {
      return { success: false, message: "User not found." }
    }

    // Handle password update separately if provided
    if (password) {
      updateData.password = await bcrypt.hash(password, 10)
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...updateData,
        teamId: teamId === "none" ? null : teamId,
      },
    })

    revalidatePath("/admin/users")
    return { success: true, message: "User updated successfully.", user: updatedUser }
  } catch (error: any) {
    if (error.code === "P2002" && error.meta?.target?.includes("email")) {
      return {
        success: false,
        message: "Another user with this email already exists.",
        errors: { email: ["Email already in use by another user."] },
      }
    }
    console.error("Failed to update user:", error)
    return { success: false, message: "Failed to update user." }
  }
}

export async function deleteUser(id: string) {
  try {
    await prisma.user.delete({
      where: { id },
    })
    revalidatePath("/admin/users")
    return { success: true, message: "User deleted successfully." }
  } catch (error) {
    console.error("Failed to delete user:", error)
    return { success: false, message: "Failed to delete user." }
  }
}
