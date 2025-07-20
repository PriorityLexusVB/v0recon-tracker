"use server"

import { signIn, signOut } from "@/lib/auth"
import { AuthError } from "next-auth"
import { redirect } from "next/navigation"
import bcrypt from "bcryptjs"
import prisma from "@/lib/prisma"
import { SignUpSchema, ForgotPasswordSchema, ResetPasswordSchema } from "@/lib/definitions"
import { sendEmailNotification } from "@/lib/email-service"
import crypto from "crypto"

export async function authenticate(prevState: string | undefined, formData: FormData) {
  try {
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    await signIn("credentials", {
      email,
      password,
      redirect: false,
    })
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "Invalid credentials."
        default:
          return "Something went wrong."
      }
    }
    throw error
  }
  redirect("/")
}

export async function signUp(prevState: string | undefined, formData: FormData) {
  try {
    const validatedFields = SignUpSchema.safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      department: formData.get("department"),
      role: formData.get("role") || "USER",
    })

    if (!validatedFields.success) {
      return "Invalid fields."
    }

    const { name, email, password, department, role } = validatedFields.data

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return "User already exists."
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        department,
        role,
      },
    })

    // Send welcome email
    try {
      await sendEmailNotification({
        to: email,
        subject: "Welcome to Recon Tracker",
        message: `Welcome ${name}! Your account has been created successfully.`,
        type: "welcome",
      })
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError)
    }

    return "success"
  } catch (error) {
    console.error("Sign up error:", error)
    return "Something went wrong."
  }
}

export async function forgotPassword(prevState: string | undefined, formData: FormData) {
  try {
    const validatedFields = ForgotPasswordSchema.safeParse({
      email: formData.get("email"),
    })

    if (!validatedFields.success) {
      return "Invalid email."
    }

    const { email } = validatedFields.data

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      // Don't reveal if user exists or not
      return "If an account with that email exists, we sent you a reset link."
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex")
    const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 hour

    // Save reset token
    await prisma.user.update({
      where: { email },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    })

    // Send reset email
    try {
      await sendEmailNotification({
        to: email,
        subject: "Password Reset Request",
        message: `Click the link to reset your password: ${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`,
        type: "password_reset",
      })
    } catch (emailError) {
      console.error("Failed to send reset email:", emailError)
      return "Failed to send reset email."
    }

    return "If an account with that email exists, we sent you a reset link."
  } catch (error) {
    console.error("Forgot password error:", error)
    return "Something went wrong."
  }
}

export async function resetPassword(prevState: string | undefined, formData: FormData) {
  try {
    const validatedFields = ResetPasswordSchema.safeParse({
      token: formData.get("token"),
      password: formData.get("password"),
    })

    if (!validatedFields.success) {
      return "Invalid fields."
    }

    const { token, password } = validatedFields.data

    // Find user with valid reset token
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date(),
        },
      },
    })

    if (!user) {
      return "Invalid or expired reset token."
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Update password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    })

    return "success"
  } catch (error) {
    console.error("Reset password error:", error)
    return "Something went wrong."
  }
}

export async function signOutAction() {
  await signOut()
}
