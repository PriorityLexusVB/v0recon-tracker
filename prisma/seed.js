const { PrismaClient } = require("@prisma/client")
const bcrypt = require("bcryptjs")

const prisma = new PrismaClient()

async function main() {
  // Create users
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@recontracker.com" },
    update: {},
    create: {
      email: "admin@recontracker.com",
      name: "Admin User",
      password: await bcrypt.hash("admin123", 10),
      role: "ADMIN",
    },
  })

  const managerUser = await prisma.user.upsert({
    where: { email: "manager@recontracker.com" },
    update: {},
    create: {
      email: "manager@recontracker.com",
      name: "Manager User",
      password: await bcrypt.hash("manager123", 10),
      role: "MANAGER",
    },
  })

  const shopUser = await prisma.user.upsert({
    where: { email: "shop@recontracker.com" },
    update: {},
    create: {
      email: "shop@recontracker.com",
      name: "Shop User",
      password: await bcrypt.hash("user123", 10),
      role: "USER",
    },
  })

  // Create teams
  const detailTeam = await prisma.team.upsert({
    where: { name: "Detail Team" },
    update: {},
    create: {
      name: "Detail Team",
      description: "Vehicle detailing and cleaning",
    },
  })

  const mechanicTeam = await prisma.team.upsert({
    where: { name: "Mechanic Team" },
    update: {},
    create: {
      name: "Mechanic Team",
      description: "Mechanical repairs and maintenance",
    },
  })

  const bodyShopTeam = await prisma.team.upsert({
    where: { name: "Body Shop Team" },
    update: {},
    create: {
      name: "Body Shop Team",
      description: "Body work and paint repairs",
    },
  })

  // Create team members
  await prisma.teamMember.upsert({
    where: { userId_teamId: { userId: managerUser.id, teamId: detailTeam.id } },
    update: {},
    create: {
      userId: managerUser.id,
      teamId: detailTeam.id,
      role: "LEAD",
    },
  })

  await prisma.teamMember.upsert({
    where: { userId_teamId: { userId: shopUser.id, teamId: detailTeam.id } },
    update: {},
    create: {
      userId: shopUser.id,
      teamId: detailTeam.id,
      role: "MEMBER",
    },
  })

  // Create sample vehicles
  const vehicles = [
    {
      vin: "1HGBH41JXMN109186",
      make: "Honda",
      model: "Civic",
      year: 2021,
      color: "Silver",
      status: "IN_PROGRESS",
      priority: "HIGH",
    },
    {
      vin: "2T1BURHE0JC123456",
      make: "Toyota",
      model: "Corolla",
      year: 2020,
      color: "White",
      status: "PENDING",
      priority: "MEDIUM",
    },
    {
      vin: "3VW2B7AJ8KM123789",
      make: "Volkswagen",
      model: "Jetta",
      year: 2019,
      color: "Black",
      status: "COMPLETED",
      priority: "LOW",
    },
  ]

  for (const vehicleData of vehicles) {
    await prisma.vehicle.upsert({
      where: { vin: vehicleData.vin },
      update: {},
      create: vehicleData,
    })
  }

  console.log("Database seeded successfully!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
