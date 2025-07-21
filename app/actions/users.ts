"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"

export async function getUsers() {
  const session = await auth()

  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized")
  }

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        teamMemberships: {
          include: {
            team: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return users
  } catch (error) {
    console.error("Error fetching users:", error)
    throw new Error("Failed to fetch users")
  }
}

export async function createUser(formData: FormData) {
  const session = await auth()

  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized")
  }

  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const role = formData.get("role") as string

  if (!name || !email || !password || !role) {
    throw new Error("All fields are required")
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10)

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      },
    })

    revalidatePath("/admin/users")
    return { success: true, message: "User created successfully" }
  } catch (error) {
    console.error("Error creating user:", error)
    if (error.code === "P2002") {
      throw new Error("Email already exists")
    }
    throw new Error("Failed to create user")
  }
}

export async function updateUser(id: string, formData: FormData) {
  const session = await auth()

  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized")
  }

  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const role = formData.get("role") as string

  if (!name || !email || !role) {
    throw new Error("Name, email, and role are required")
  }

  try {
    await prisma.user.update({
      where: { id },
      data: {
        name,
        email,
        role,
      },
    })

    revalidatePath("/admin/users")
    return { success: true, message: "User updated successfully" }
  } catch (error) {
    console.error("Error updating user:", error)
    if (error.code === "P2002") {
      throw new Error("Email already exists")
    }
    throw new Error("Failed to update user")
  }
}

export async function deleteUser(id: string) {
  const session = await auth()

  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized")
  }

  try {
    await prisma.user.delete({
      where: { id },
    })

    revalidatePath("/admin/users")
    return { success: true, message: "User deleted successfully" }
  } catch (error) {
    console.error("Error deleting user:", error)
    throw new Error("Failed to delete user")
  }
}

export async function updateUserPassword(id: string, formData: FormData) {
  const session = await auth()

  if (!session?.user || (session.user.role !== "ADMIN" && session.user.id !== id)) {
    throw new Error("Unauthorized")
  }

  const password = formData.get("password") as string

  if (!password) {
    throw new Error("Password is required")
  }

  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters long")
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10)

    await prisma.user.update({
      where: { id },
      data: {
        password: hashedPassword,
      },
    })

    revalidatePath("/admin/users")
    revalidatePath("/settings")
    return { success: true, message: "Password updated successfully" }
  } catch (error) {
    console.error("Error updating password:", error)
    throw new Error("Failed to update password")
  }
}
