const { PrismaClient } = require("@prisma/client")
const bcrypt = require("bcryptjs")

const prisma = new PrismaClient()

async function main() {
  // Create a default admin user if one doesn't exist
  const existingAdmin = await prisma.user.findFirst({
    where: { role: "ADMIN" },
  })

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash("adminpassword", 10) // Hash a default password
    await prisma.user.create({
      data: {
        name: "Admin User",
        email: "admin@example.com",
        password: hashedPassword,
        role: "ADMIN",
        department: "Management",
        status: "ACTIVE",
      },
    })
    console.log("Default admin user created.")
  } else {
    console.log("Admin user already exists.")
  }

  // Create sample teams if they don't exist
  const teams = [
    { id: "team_sales_123", name: "Sales Team" },
    { id: "team_service_456", name: "Service Team" },
    { id: "team_detail_789", name: "Detail Team" },
  ]

  for (const teamData of teams) {
    await prisma.team.upsert({
      where: { id: teamData.id },
      update: {},
      create: teamData,
    })
  }
  console.log("Sample teams ensured.")

  // Create sample vehicles if they don't exist
  const existingVehicles = await prisma.vehicle.count()
  if (existingVehicles === 0) {
    const sampleVehicles = [
      {
        vin: "1FAHP2E16FXXXXXXX1",
        stockNumber: "V001",
        year: 2022,
        make: "Ford",
        model: "F-150",
        trim: "XLT",
        color: "Black",
        mileage: 35000,
        status: "IN_PROGRESS",
        currentLocation: "Mechanical Shop",
        reconditioningCost: 1200.5,
        daysInRecon: 5,
        lastUpdated: new Date(),
      },
      {
        vin: "2T1BURHE0JCXXXXXX2",
        stockNumber: "V002",
        year: 2023,
        make: "Toyota",
        model: "Camry",
        trim: "SE",
        color: "Silver",
        mileage: 15000,
        status: "PENDING_INSPECTION",
        currentLocation: "Inspection Bay",
        reconditioningCost: 0,
        daysInRecon: 1,
        lastUpdated: new Date(),
      },
      {
        vin: "3GCUYDED5NZXXXXXX3",
        stockNumber: "V003",
        year: 2021,
        make: "Chevrolet",
        model: "Silverado",
        trim: "LTZ",
        color: "White",
        mileage: 50000,
        status: "AWAITING_PARTS",
        currentLocation: "Parts Department",
        reconditioningCost: 800.0,
        daysInRecon: 10,
        lastUpdated: new Date(),
      },
      {
        vin: "4JGDA3F30LXXXXXXX4",
        stockNumber: "V004",
        year: 2024,
        make: "Honda",
        model: "CR-V",
        trim: "EX-L",
        color: "Blue",
        mileage: 5000,
        status: "READY_FOR_SALE",
        currentLocation: "Showroom",
        reconditioningCost: 300.0,
        daysInRecon: 3,
        lastUpdated: new Date(),
      },
      {
        vin: "5NPAD4AE1MXXXXXXX5",
        stockNumber: "V005",
        year: 2020,
        make: "Nissan",
        model: "Altima",
        trim: "SV",
        color: "Red",
        mileage: 60000,
        status: "COMPLETED",
        currentLocation: "Sales Lot",
        reconditioningCost: 1500.0,
        daysInRecon: 7,
        lastUpdated: new Date(new Date().setDate(new Date().getDate() - 10)), // Completed 10 days ago
      },
    ]

    for (const vehicleData of sampleVehicles) {
      await prisma.vehicle.create({ data: vehicleData })
    }
    console.log("Sample vehicles created.")
  } else {
    console.log("Vehicles already exist, skipping sample data creation.")
  }

  // Create default settings if they don't exist
  const existingSettings = await prisma.settings.findFirst()
  if (!existingSettings) {
    await prisma.settings.create({
      data: {
        emailEnabled: true,
        emailFromAddress: "noreply@recontracker.com",
        emailSignature: "Best regards,\nThe Recon Tracker Team",
        smsEnabled: false,
        smsProvider: "NONE",
        smsFromNumber: null,
        googleSheetsSyncEnabled: false,
        googleSheetsUrl: null,
        googleSheetsLastSync: null,
        dataRetentionDays: 365,
      },
    })
    console.log("Default settings created.")
  } else {
    console.log("Settings already exist.")
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
