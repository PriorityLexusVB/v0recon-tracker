import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcryptjs from "bcryptjs"

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ message: "Email and password are required." }, { status: 400 })
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json({ message: "User with this email already exists." }, { status: 409 })
    }

    const hashedPassword = await bcryptjs.hash(password, 12)

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "USER", // Default role for new signups
      },
    })

    return NextResponse.json({ message: "User created successfully.", user: newUser }, { status: 201 })
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ message: "Internal server error." }, { status: 500 })
  }
}
