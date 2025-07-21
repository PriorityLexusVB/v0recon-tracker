"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"

export async function getUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        teamMembers: {
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

export async function createUser(data: {
  name: string
  email: string
  password: string
  role: string
}) {
  try {
    const hashedPassword = await bcrypt.hash(data.password, 10)

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: data.role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    revalidatePath("/admin/users")
    return { success: true, user }
  } catch (error) {
    console.error("Error creating user:", error)
    if (error.code === "P2002") {
      return { success: false, error: "Email already exists" }
    }
    return { success: false, error: "Failed to create user" }
  }
}

export async function updateUser(
  id: string,
  data: {
    name: string
    email: string
    role: string
  },
) {
  try {
    const user = await prisma.user.update({
      where: { id },
      data: {
        name: data.name,
        email: data.email,
        role: data.role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    revalidatePath("/admin/users")
    return { success: true, user }
  } catch (error) {
    console.error("Error updating user:", error)
    if (error.code === "P2002") {
      return { success: false, error: "Email already exists" }
    }
    return { success: false, error: "Failed to update user" }
  }
}

export async function deleteUser(id: string) {
  try {
    await prisma.user.delete({
      where: { id },
    })

    revalidatePath("/admin/users")
    return { success: true }
  } catch (error) {
    console.error("Error deleting user:", error)
    return { success: false, error: "Failed to delete user" }
  }
}

export async function updateUserPassword(id: string, newPassword: string) {
  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    })

    revalidatePath("/admin/users")
    return { success: true }
  } catch (error) {
    console.error("Error updating user password:", error)
    return { success: false, error: "Failed to update password" }
  }
}
