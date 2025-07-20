"use server"

import { auth } from "@/lib/auth"
import bcrypt from "bcryptjs"
import prisma from "@/lib/prisma"
import { ChangePasswordSchema, UpdateProfileSchema } from "@/lib/definitions"
import { revalidatePath } from "next/cache"

export async function changePassword(prevState: string | undefined, formData: FormData) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return "Unauthorized"
    }

    const validatedFields = ChangePasswordSchema.safeParse({
      currentPassword: formData.get("currentPassword"),
      newPassword: formData.get("newPassword"),
    })

    if (!validatedFields.success) {
      return "Invalid fields."
    }

    const { currentPassword, newPassword } = validatedFields.data

    // Get current user
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user || !user.password) {
      return "User not found."
    }

    // Verify current password
    const passwordsMatch = await bcrypt.compare(currentPassword, user.password)
    if (!passwordsMatch) {
      return "Current password is incorrect."
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12)

    // Update password
    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashedPassword },
    })

    return "success"
  } catch (error) {
    console.error("Change password error:", error)
    return "Something went wrong."
  }
}

export async function updateUserProfile(prevState: string | undefined, formData: FormData) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return "Unauthorized"
    }

    const validatedFields = UpdateProfileSchema.safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      department: formData.get("department"),
    })

    if (!validatedFields.success) {
      return "Invalid fields."
    }

    const { name, email, department } = validatedFields.data

    // Check if email is already taken by another user
    if (email !== session.user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      })

      if (existingUser && existingUser.id !== session.user.id) {
        return "Email is already taken."
      }
    }

    // Update user profile
    await prisma.user.update({
      where: { id: session.user.id },
      data: { name, email, department },
    })

    revalidatePath("/settings")
    return "success"
  } catch (error) {
    console.error("Update profile error:", error)
    return "Something went wrong."
  }
}
