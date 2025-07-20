const { PrismaClient } = require("@prisma/client")
const bcrypt = require("bcrypt")

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Seeding database...")

  // Create demo users
  const users = [
    {
      name: "Admin User",
      email: "admin@dealership.com",
      password: await bcrypt.hash("password123", 10),
      role: "ADMIN",
      department: "Management",
    },
    {
      name: "Manager User",
      email: "manager@dealership.com",
      password: await bcrypt.hash("password123", 10),
      role: "MANAGER",
      department: "Management",
    },
    {
      name: "Tech User",
      email: "tech@dealership.com",
      password: await bcrypt.hash("password123", 10),
      role: "TECHNICIAN",
      department: "Service",
    },
    {
      name: "Detail User",
      email: "detail@dealership.com",
      password: await bcrypt.hash("password123", 10),
      role: "TECHNICIAN",
      department: "Detail",
    },
  ]

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user,
    })
  }

  console.log("✅ Database seeded successfully!")
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
