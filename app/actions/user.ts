"use server"

import { prisma } from "@/lib/prisma"
import bcryptjs from "bcryptjs"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"

export async function getUserProfile(userId: string) {
  const session = await auth()
  if (!session || !session.user) {
    throw new Error("Unauthorized")
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        isActive: true,
        createdAt: true,
        team: {
          select: {
            id: true,
            name: true,
            department: true,
          },
        },
      },
    })
    return user
  } catch (error) {
    console.error("Error fetching user profile:", error)
    throw new Error("Failed to fetch user profile.")
  }
}

export async function updateUserProfile(userId: string, formData: FormData) {
  const session = await auth()
  if (!session || !session.user || (session.user.id !== userId && session.user.role !== "ADMIN")) {
    throw new Error("Unauthorized")
  }

  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const department = formData.get("department") as string
  const currentPassword = formData.get("currentPassword") as string
  const newPassword = formData.get("newPassword") as string

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      throw new Error("User not found.")
    }

    if (currentPassword && newPassword) {
      const isPasswordValid = await bcryptjs.compare(currentPassword, user.password)
      if (!isPasswordValid) {
        throw new Error("Invalid current password.")
      }
      const hashedPassword = await bcryptjs.hash(newPassword, 12)
      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      })
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        name: name || null,
        email: email,
        department: department || null,
      },
    })

    revalidatePath(`/settings`)
    return { success: true, message: "Profile updated successfully." }
  } catch (error) {
    console.error("Error updating user profile:", error)
    return { success: false, message: error instanceof Error ? error.message : "Failed to update profile." }
  }
}

export async function updateNotificationSettings(userId: string, formData: FormData) {
  const session = await auth()
  if (!session || !session.user || session.user.id !== userId) {
    throw new Error("Unauthorized")
  }

  const emailNotifications = formData.get("emailNotifications") === "on"
  const smsNotifications = formData.get("smsNotifications") === "on"

  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        emailNotificationsEnabled: emailNotifications,
        smsNotificationsEnabled: smsNotifications,
      },
    })
    revalidatePath(`/settings`)
    return { success: true, message: "Notification settings updated." }
  } catch (error) {
    console.error("Error updating notification settings:", error)
    return { success: false, message: "Failed to update notification settings." }
  }
}
