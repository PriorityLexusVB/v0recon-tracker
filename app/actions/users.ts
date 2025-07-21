"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { hash } from "bcryptjs"

const userSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["USER", "ADMIN", "MANAGER"]),
  status: z.enum(["ACTIVE", "INACTIVE", "PENDING"]),
  teamId: z.string().optional().nullable(),
})

const createUserSchema = userSchema.omit({ id: true }).extend({
  password: z.string().min(6, "Password must be at least 6 characters long"),
})

const updateUserSchema = userSchema.partial().extend({
  id: z.string(),
  password: z.string().min(6, "Password must be at least 6 characters long").optional(),
})

export async function fetchUsers(query = "", page = 1, limit = 10) {
  try {
    const offset = (page - 1) * limit
    const users = await prisma.user.findMany({
      where: {
        OR: [{ name: { contains: query, mode: "insensitive" } }, { email: { contains: query, mode: "insensitive" } }],
      },
      include: {
        team: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: offset,
      take: limit,
    })

    const totalUsers = await prisma.user.count({
      where: {
        OR: [{ name: { contains: query, mode: "insensitive" } }, { email: { contains: query, mode: "insensitive" } }],
      },
    })

    revalidatePath("/admin/users")
    return { users, totalPages: Math.ceil(totalUsers / limit), currentPage: page }
  } catch (error) {
    console.error("Failed to fetch users:", error)
    throw new Error("Failed to fetch users.")
  }
}

export async function fetchUserById(id: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: { team: true },
    })
    if (!user) {
      throw new Error("User not found.")
    }
    revalidatePath(`/admin/users/${id}`)
    return user
  } catch (error) {
    console.error(`Failed to fetch user with ID ${id}:`, error)
    throw new Error(`Failed to fetch user with ID ${id}.`)
  }
}

export async function createUser(formData: FormData) {
  const data = Object.fromEntries(formData.entries())
  const parsed = createUserSchema.safeParse(data)

  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors }
  }

  const { name, email, password, role, status, teamId } = parsed.data

  try {
    const hashedPassword = await hash(password, 10)
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        status,
        teamId: teamId || null,
      },
    })
    revalidatePath("/admin/users")
    return { success: true, message: "User created successfully." }
  } catch (error) {
    console.error("Failed to create user:", error)
    return { success: false, message: "Failed to create user." }
  }
}

export async function updateUser(formData: FormData) {
  const data = Object.fromEntries(formData.entries())
  const parsed = updateUserSchema.safeParse(data)

  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors }
  }

  const { id, name, email, password, role, status, teamId } = parsed.data

  try {
    const updateData: any = { name, email, role, status, teamId: teamId || null }
    if (password) {
      updateData.password = await hash(password, 10)
    }

    await prisma.user.update({
      where: { id },
      data: updateData,
    })
    revalidatePath("/admin/users")
    revalidatePath(`/admin/users/${id}`)
    return { success: true, message: "User updated successfully." }
  } catch (error) {
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
    throw new Error("Failed to delete user.")
  }
}
