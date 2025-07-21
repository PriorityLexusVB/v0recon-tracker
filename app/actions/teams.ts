"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const teamSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Team name is required."),
  description: z.string().optional().nullable(),
})

export async function fetchTeams(query = "", page = 1, limit = 10) {
  try {
    const offset = (page - 1) * limit
    const whereClause: any = {
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
      ],
    }

    const teams = await prisma.team.findMany({
      where: whereClause,
      include: {
        members: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: {
        name: "asc",
      },
      skip: offset,
      take: limit,
    })

    const totalTeams = await prisma.team.count({ where: whereClause })

    revalidatePath("/admin/teams")
    return { teams, totalPages: Math.ceil(totalTeams / limit), currentPage: page, success: true }
  } catch (error) {
    console.error("Failed to fetch teams:", error)
    return { teams: [], totalPages: 0, currentPage: 1, success: false, message: "Failed to fetch teams." }
  }
}

export async function fetchTeamsForSelect() {
  try {
    const teams = await prisma.team.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: "asc",
      },
    })
    return { teams, success: true }
  } catch (error) {
    console.error("Failed to fetch teams for select:", error)
    return { teams: [], success: false, message: "Failed to fetch teams for selection." }
  }
}

export async function createTeam(formData: FormData) {
  const data = Object.fromEntries(formData.entries())
  const parsed = teamSchema.safeParse(data)

  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors, message: "Validation failed." }
  }

  const { name, description } = parsed.data

  try {
    const existingTeam = await prisma.team.findUnique({ where: { name } })
    if (existingTeam) {
      return {
        success: false,
        message: "Team with this name already exists.",
        errors: { name: ["Team name already in use."] },
      }
    }

    const newTeam = await prisma.team.create({
      data: {
        name,
        description,
      },
    })

    revalidatePath("/admin/teams")
    return { success: true, message: "Team created successfully.", team: newTeam }
  } catch (error) {
    console.error("Failed to create team:", error)
    return { success: false, message: "Failed to create team." }
  }
}

export async function updateTeam(formData: FormData) {
  const data = Object.fromEntries(formData.entries())
  const parsed = teamSchema
    .partial()
    .extend({ id: z.string().min(1, "Team ID is required.") })
    .safeParse(data)

  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors, message: "Validation failed." }
  }

  const { id, name, description } = parsed.data

  if (!id) {
    return { success: false, message: "Team ID is required for update." }
  }

  try {
    const existingTeam = await prisma.team.findUnique({ where: { id } })
    if (!existingTeam) {
      return { success: false, message: "Team not found." }
    }

    if (name && name !== existingTeam.name) {
      const teamWithName = await prisma.team.findUnique({ where: { name } })
      if (teamWithName) {
        return {
          success: false,
          message: "Another team with this name already exists.",
          errors: { name: ["Team name already in use."] },
        }
      }
    }

    const updatedTeam = await prisma.team.update({
      where: { id },
      data: {
        name,
        description,
      },
    })

    revalidatePath("/admin/teams")
    return { success: true, message: "Team updated successfully.", team: updatedTeam }
  } catch (error) {
    console.error("Failed to update team:", error)
    return { success: false, message: "Failed to update team." }
  }
}

export async function deleteTeam(id: string) {
  try {
    // Before deleting a team, consider reassigning or nullifying teamId for its members
    await prisma.user.updateMany({
      where: { teamId: id },
      data: { teamId: null },
    })

    await prisma.team.delete({
      where: { id },
    })
    revalidatePath("/admin/teams")
    return { success: true, message: "Team deleted successfully." }
  } catch (error) {
    console.error("Failed to delete team:", error)
    return { success: false, message: "Failed to delete team." }
  }
}
