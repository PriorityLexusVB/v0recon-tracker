const { PrismaClient } = require("@prisma/client")
const bcryptjs = require("bcryptjs")

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Starting database seed...")

  // Create admin user
  const adminPassword = await bcryptjs.hash("admin123", 12)
  const admin = await prisma.user.upsert({
    where: { email: "admin@recontracker.com" },
    update: {},
    create: {
      email: "admin@recontracker.com",
      name: "System Administrator",
      password: adminPassword,
      role: "ADMIN",
      department: "Management",
    },
  })
  console.log("✅ Created admin user:", admin.email)

  // Create manager user
  const managerPassword = await bcryptjs.hash("manager123", 12)
  const manager = await prisma.user.upsert({
    where: { email: "manager@recontracker.com" },
    update: {},
    create: {
      email: "manager@recontracker.com",
      name: "Shop Manager",
      password: managerPassword,
      role: "MANAGER",
      department: "Operations",
    },
  })
  console.log("✅ Created manager user:", manager.email)

  // Create regular users
  const userPassword = await bcryptjs.hash("user123", 12)

  const shopUser = await prisma.user.upsert({
    where: { email: "shop@recontracker.com" },
    update: {},
    create: {
      email: "shop@recontracker.com",
      name: "John Smith",
      password: userPassword,
      role: "USER",
      department: "Shop",
    },
  })

  const detailUser = await prisma.user.upsert({
    where: { email: "detail@recontracker.com" },
    update: {},
    create: {
      email: "detail@recontracker.com",
      name: "Sarah Johnson",
      password: userPassword,
      role: "USER",
      department: "Detail",
    },
  })

  const photoUser = await prisma.user.upsert({
    where: { email: "photo@recontracker.com" },
    update: {},
    create: {
      email: "photo@recontracker.com",
      name: "Mike Wilson",
      password: userPassword,
      role: "USER",
      department: "Photo",
    },
  })

  console.log("✅ Created regular users")

  // Create teams
  const shopTeam = await prisma.team.upsert({
    where: { name: "Shop Team A" },
    update: {},
    create: {
      name: "Shop Team A",
      description: "Primary shop reconditioning team",
      department: "shop",
      createdBy: admin.id,
    },
  })

  const detailTeam = await prisma.team.upsert({
    where: { name: "Detail Team" },
    update: {},
    create: {
      name: "Detail Team",
      description: "Vehicle detailing specialists",
      department: "detail",
      createdBy: admin.id,
    },
  })

  const photoTeam = await prisma.team.upsert({
    where: { name: "Photo Team" },
    update: {},
    create: {
      name: "Photo Team",
      description: "Vehicle photography team",
      department: "photo",
      createdBy: admin.id,
    },
  })

  console.log("✅ Created teams")

  // Add users to teams
  await prisma.teamMember.upsert({
    where: {
      teamId_userId: {
        teamId: shopTeam.id,
        userId: shopUser.id,
      },
    },
    update: {},
    create: {
      teamId: shopTeam.id,
      userId: shopUser.id,
      assignedBy: admin.id,
    },
  })

  await prisma.teamMember.upsert({
    where: {
      teamId_userId: {
        teamId: detailTeam.id,
        userId: detailUser.id,
      },
    },
    update: {},
    create: {
      teamId: detailTeam.id,
      userId: detailUser.id,
      assignedBy: admin.id,
    },
  })

  await prisma.teamMember.upsert({
    where: {
      teamId_userId: {
        teamId: photoTeam.id,
        userId: photoUser.id,
      },
    },
    update: {},
    create: {
      teamId: photoTeam.id,
      userId: photoUser.id,
      assignedBy: admin.id,
    },
  })

  console.log("✅ Added users to teams")

  // Create sample vehicles
  const vehicles = [
    {
      vin: "1HGBH41JXMN109186",
      make: "Honda",
      model: "Accord",
      year: 2022,
      stock: "A12345",
      price: 24500,
      inventoryDate: new Date("2024-01-15"),
      daysInRecon: 5,
      priority: "normal",
    },
    {
      vin: "1FTFW1ET5DFC10312",
      make: "Ford",
      model: "F-150",
      year: 2021,
      stock: "B67890",
      price: 32000,
      inventoryDate: new Date("2024-01-10"),
      daysInRecon: 10,
      priority: "high",
    },
    {
      vin: "2T1BURHE0JC123456",
      make: "Toyota",
      model: "Camry",
      year: 2023,
      stock: "C11111",
      price: 26000,
      inventoryDate: new Date("2024-01-12"),
      daysInRecon: 8,
      priority: "normal",
      throughShop: true,
      shopDoneDate: new Date("2024-01-17"),
    },
    {
      vin: "1GCUYDED5NZ123456",
      make: "Chevrolet",
      model: "Silverado",
      year: 2023,
      stock: "D22222",
      price: 48000,
      inventoryDate: new Date("2024-01-14"),
      daysInRecon: 6,
      priority: "normal",
    },
    {
      vin: "1N4BL4BV4NC123456",
      make: "Nissan",
      model: "Altima",
      year: 2022,
      stock: "E33333",
      price: 26000,
      inventoryDate: new Date("2024-01-06"),
      daysInRecon: 14,
      priority: "urgent",
      throughShop: true,
      shopDoneDate: new Date("2024-01-11"),
      detailComplete: true,
      detailDoneDate: new Date("2024-01-16"),
    },
  ]

  for (const vehicleData of vehicles) {
    await prisma.vehicle.upsert({
      where: { vin: vehicleData.vin },
      update: {},
      create: vehicleData,
    })
  }

  console.log("✅ Created sample vehicles")

  // Create some vehicle assignments
  const vehicle1 = await prisma.vehicle.findUnique({ where: { vin: "1HGBH41JXMN109186" } })
  const vehicle2 = await prisma.vehicle.findUnique({ where: { vin: "1FTFW1ET5DFC10312" } })

  if (vehicle1) {
    await prisma.vehicleAssignment.upsert({
      where: {
        vehicleId_teamId: {
          vehicleId: vehicle1.id,
          teamId: shopTeam.id,
        },
      },
      update: {},
      create: {
        vehicleId: vehicle1.id,
        teamId: shopTeam.id,
        assignedToUserId: shopUser.id,
        assignedById: manager.id,
        priority: "normal",
        notes: "Standard shop work required",
      },
    })

    await prisma.vehicle.update({
      where: { id: vehicle1.id },
      data: {
        status: "ASSIGNED",
        assignedTo: shopUser.id,
      },
    })
  }

  if (vehicle2) {
    await prisma.vehicleAssignment.upsert({
      where: {
        vehicleId_teamId: {
          vehicleId: vehicle2.id,
          teamId: shopTeam.id,
        },
      },
      update: {},
      create: {
        vehicleId: vehicle2.id,
        teamId: shopTeam.id,
        assignedById: manager.id,
        priority: "high",
        notes: "Priority vehicle - customer waiting",
      },
    })

    await prisma.vehicle.update({
      where: { id: vehicle2.id },
      data: {
        status: "ASSIGNED",
      },
    })
  }

  console.log("✅ Created vehicle assignments")

  // Create system settings
  const defaultSettings = [
    { key: "system_name", value: "Recon Tracker", type: "string" },
    { key: "system_description", value: "Vehicle Reconditioning Management System", type: "string" },
    { key: "maintenance_mode", value: "false", type: "boolean" },
    { key: "email_notifications", value: "true", type: "boolean" },
    { key: "sms_notifications", value: "false", type: "boolean" },
    { key: "auto_sync_interval", value: "60", type: "number" },
    { key: "session_timeout", value: "480", type: "number" },
    { key: "password_min_length", value: "8", type: "number" },
    { key: "max_vehicles_per_page", value: "50", type: "number" },
  ]

  for (const setting of defaultSettings) {
    await prisma.systemSettings.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    })
  }

  console.log("✅ Created system settings")

  console.log("🎉 Database seed completed successfully!")
  console.log("")
  console.log("📋 Default login credentials:")
  console.log("Admin: admin@recontracker.com / admin123")
  console.log("Manager: manager@recontracker.com / manager123")
  console.log("Shop User: shop@recontracker.com / user123")
  console.log("Detail User: detail@recontracker.com / user123")
  console.log("Photo User: photo@recontracker.com / user123")
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
