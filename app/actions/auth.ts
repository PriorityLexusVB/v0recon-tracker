"use server"

import { signIn, signOut } from "@/lib/auth"
import { AuthError } from "next-auth"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { sendEmailNotification } from "@/lib/email-service"
import { generatePasswordResetToken } from "@/lib/tokens"
import { NotificationType } from "@/lib/notification-types"
import { createAndSendNotification } from "@/lib/notification-service"

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
})

const signupSchema = z.object({
  name: z.string().min(1, { message: "Name is required." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
})

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
})

const resetPasswordSchema = z.object({
  token: z.string().min(1, { message: "Token is required." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
})

export async function authenticate(prevState: string | undefined, formData: FormData) {
  const validatedFields = loginSchema.safeParse(Object.fromEntries(formData.entries()))

  if (!validatedFields.success) {
    return JSON.stringify({
      success: false,
      message: "Invalid credentials.",
      errors: validatedFields.error.flatten().fieldErrors,
    })
  }

  const { email, password } = validatedFields.data

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/recon/cards", // Redirect to dashboard after successful login
    })
    return JSON.stringify({ success: true, message: "Login successful." })
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return JSON.stringify({ success: false, message: "Invalid credentials." })
        default:
          return JSON.stringify({ success: false, message: "Something went wrong." })
      }
    }
    throw error
  }
}

export async function registerUser(prevState: string | undefined, formData: FormData) {
  const validatedFields = signupSchema.safeParse(Object.fromEntries(formData.entries()))

  if (!validatedFields.success) {
    return JSON.stringify({
      success: false,
      message: "Validation failed.",
      errors: validatedFields.error.flatten().fieldErrors,
    })
  }

  const { name, email, password } = validatedFields.data

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return JSON.stringify({
        success: false,
        message: "User with this email already exists.",
        errors: { email: ["Email already in use."] },
      })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "USER", // Default role for new sign-ups
        status: "ACTIVE", // Or "PENDING" if email verification is needed
      },
    })

    // Send welcome notification
    await createAndSendNotification({
      userId: newUser.id,
      type: NotificationType.WELCOME,
      message: `Welcome to Recon Tracker, ${newUser.name}! We're excited to have you.`,
    })

    return JSON.stringify({ success: true, message: "Registration successful. Please sign in." })
  } catch (error) {
    console.error("Error registering user:", error)
    return JSON.stringify({ success: false, message: "Failed to register user." })
  }
}

export async function logout() {
  await signOut({ redirectTo: "/auth/signin" })
}

export async function sendPasswordResetEmail(prevState: string | undefined, formData: FormData) {
  const validatedFields = forgotPasswordSchema.safeParse(Object.fromEntries(formData.entries()))

  if (!validatedFields.success) {
    return JSON.stringify({
      success: false,
      message: "Invalid email address.",
      errors: validatedFields.error.flatten().fieldErrors,
    })
  }

  const { email } = validatedFields.data

  try {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      // For security, don't reveal if the email doesn't exist
      return JSON.stringify({
        success: true,
        message: "If an account with that email exists, a password reset link has been sent.",
      })
    }

    const token = await generatePasswordResetToken(email)
    const resetLink = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`

    await sendEmailNotification({
      to: email,
      subject: "Recon Tracker Password Reset",
      message: `You requested a password reset. Click here to reset your password: ${resetLink}`,
      type: "password_reset",
    })

    return JSON.stringify({
      success: true,
      message: "If an account with that email exists, a password reset link has been sent.",
    })
  } catch (error) {
    console.error("Error sending password reset email:", error)
    return JSON.stringify({ success: false, message: "Failed to send password reset email." })
  }
}

export async function resetPassword(prevState: string | undefined, formData: FormData) {
  const validatedFields = resetPasswordSchema.safeParse(Object.fromEntries(formData.entries()))

  if (!validatedFields.success) {
    return JSON.stringify({
      success: false,
      message: "Invalid input.",
      errors: validatedFields.error.flatten().fieldErrors,
    })
  }

  const { token, password } = validatedFields.data

  try {
    const existingToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    })

    if (!existingToken || existingToken.expires < new Date()) {
      return JSON.stringify({ success: false, message: "Invalid or expired token." })
    }

    const user = await prisma.user.findUnique({
      where: { email: existingToken.email },
    })

    if (!user) {
      return JSON.stringify({ success: false, message: "User not found." })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    })

    await prisma.passwordResetToken.delete({
      where: { id: existingToken.id },
    })

    return JSON.stringify({ success: true, message: "Password reset successfully. You can now sign in." })
  } catch (error) {
    console.error("Error resetting password:", error)
    return JSON.stringify({ success: false, message: "Failed to reset password." })
  }
}
