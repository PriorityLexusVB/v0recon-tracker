const { PrismaClient } = require("@prisma/client")
const bcrypt = require("bcryptjs")

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Starting database seed...")

  // Create users
  const adminPassword = await bcrypt.hash("admin123", 10)
  const managerPassword = await bcrypt.hash("manager123", 10)
  const userPassword = await bcrypt.hash("user123", 10)

  const admin = await prisma.user.upsert({
    where: { email: "admin@recontracker.com" },
    update: {},
    create: {
      email: "admin@recontracker.com",
      name: "Admin User",
      password: adminPassword,
      role: "ADMIN",
    },
  })

  const manager = await prisma.user.upsert({
    where: { email: "manager@recontracker.com" },
    update: {},
    create: {
      email: "manager@recontracker.com",
      name: "Manager User",
      password: managerPassword,
      role: "MANAGER",
    },
  })

  const user = await prisma.user.upsert({
    where: { email: "shop@recontracker.com" },
    update: {},
    create: {
      email: "shop@recontracker.com",
      name: "Shop User",
      password: userPassword,
      role: "USER",
    },
  })

  console.log("✅ Users created")

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

  console.log("✅ Teams created")

  // Create team memberships
  await prisma.teamMember.upsert({
    where: {
      userId_teamId: {
        userId: manager.id,
        teamId: detailTeam.id,
      },
    },
    update: {},
    create: {
      userId: manager.id,
      teamId: detailTeam.id,
      role: "LEAD",
    },
  })

  await prisma.teamMember.upsert({
    where: {
      userId_teamId: {
        userId: user.id,
        teamId: detailTeam.id,
      },
    },
    update: {},
    create: {
      userId: user.id,
      teamId: detailTeam.id,
      role: "MEMBER",
    },
  })

  console.log("✅ Team memberships created")

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
      location: "Bay 1",
    },
    {
      vin: "1FTFW1ET5DFC10312",
      make: "Ford",
      model: "F-150",
      year: 2020,
      color: "Blue",
      status: "PENDING",
      priority: "MEDIUM",
      location: "Lot A",
    },
    {
      vin: "1G1YY22G965100001",
      make: "Chevrolet",
      model: "Corvette",
      year: 2019,
      color: "Red",
      status: "COMPLETED",
      priority: "HIGH",
      location: "Bay 3",
      completedAt: new Date(),
    },
    {
      vin: "5NPE24AF4FH123456",
      make: "Hyundai",
      model: "Elantra",
      year: 2022,
      color: "White",
      status: "PENDING",
      priority: "LOW",
      location: "Lot B",
    },
    {
      vin: "3VWD17AJ9EM123456",
      make: "Volkswagen",
      model: "Jetta",
      year: 2021,
      color: "Black",
      status: "IN_PROGRESS",
      priority: "MEDIUM",
      location: "Bay 2",
    },
  ]

  for (const vehicleData of vehicles) {
    await prisma.vehicle.upsert({
      where: { vin: vehicleData.vin },
      update: {},
      create: vehicleData,
    })
  }

  console.log("✅ Vehicles created")

  // Create vehicle assignments
  const createdVehicles = await prisma.vehicle.findMany()

  for (let i = 0; i < Math.min(3, createdVehicles.length); i++) {
    const vehicle = createdVehicles[i]
    const teams = [detailTeam, mechanicTeam, bodyShopTeam]
    const team = teams[i % teams.length]

    await prisma.vehicleAssignment.upsert({
      where: {
        vehicleId_teamId: {
          vehicleId: vehicle.id,
          teamId: team.id,
        },
      },
      update: {},
      create: {
        vehicleId: vehicle.id,
        teamId: team.id,
        userId: i === 0 ? user.id : null,
        status: vehicle.status === "COMPLETED" ? "COMPLETED" : "ASSIGNED",
        completedAt: vehicle.status === "COMPLETED" ? new Date() : null,
      },
    })
  }

  console.log("✅ Vehicle assignments created")

  // Create sample notifications
  await prisma.notification.create({
    data: {
      userId: admin.id,
      title: "Welcome to Recon Tracker",
      message: "Your account has been set up successfully.",
      type: "INFO",
    },
  })

  await prisma.notification.create({
    data: {
      userId: manager.id,
      title: "New Vehicle Assignment",
      message: "A new vehicle has been assigned to your team.",
      type: "ASSIGNMENT",
    },
  })

  console.log("✅ Notifications created")

  console.log("🎉 Database seeded successfully!")
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
