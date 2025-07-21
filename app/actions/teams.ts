"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const teamSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Team name is required"),
  description: z.string().optional().nullable(),
})

const createTeamSchema = teamSchema.omit({ id: true })
const updateTeamSchema = teamSchema.extend({ id: z.string() }).partial()

export async function fetchTeams(query = "", page = 1, limit = 10) {
  try {
    const offset = (page - 1) * limit
    const teams = await prisma.team.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
        ],
      },
      include: {
        members: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: offset,
      take: limit,
    })

    const totalTeams = await prisma.team.count({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
        ],
      },
    })

    revalidatePath("/admin/teams")
    return { teams, totalPages: Math.ceil(totalTeams / limit), currentPage: page }
  } catch (error) {
    console.error("Failed to fetch teams:", error)
    throw new Error("Failed to fetch teams.")
  }
}

export async function fetchTeamById(id: string) {
  try {
    const team = await prisma.team.findUnique({
      where: { id },
      include: {
        members: {
          select: { id: true, name: true, email: true },
        },
      },
    })
    if (!team) {
      throw new Error("Team not found.")
    }
    revalidatePath(`/admin/teams/${id}`)
    return team
  } catch (error) {
    console.error(`Failed to fetch team with ID ${id}:`, error)
    throw new Error(`Failed to fetch team with ID ${id}.`)
  }
}

export async function createTeam(formData: FormData) {
  const data = Object.fromEntries(formData.entries())
  const parsed = createTeamSchema.safeParse(data)

  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors }
  }

  const { name, description } = parsed.data

  try {
    await prisma.team.create({
      data: {
        name,
        description,
      },
    })
    revalidatePath("/admin/teams")
    return { success: true, message: "Team created successfully." }
  } catch (error) {
    console.error("Failed to create team:", error)
    return { success: false, message: "Failed to create team." }
  }
}

export async function updateTeam(formData: FormData) {
  const data = Object.fromEntries(formData.entries())
  const parsed = updateTeamSchema.safeParse(data)

  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors }
  }

  const { id, name, description } = parsed.data

  if (!id) {
    return { success: false, message: "Team ID is required for update." }
  }

  try {
    await prisma.team.update({
      where: { id },
      data: {
        name,
        description,
      },
    })
    revalidatePath("/admin/teams")
    revalidatePath(`/admin/teams/${id}`)
    return { success: true, message: "Team updated successfully." }
  } catch (error) {
    console.error("Failed to update team:", error)
    return { success: false, message: "Failed to update team." }
  }
}

export async function deleteTeam(id: string) {
  try {
    await prisma.team.delete({
      where: { id },
    })
    revalidatePath("/admin/teams")
    return { success: true, message: "Team deleted successfully." }
  } catch (error) {
    console.error("Failed to delete team:", error)
    throw new Error("Failed to delete team.")
  }
}
