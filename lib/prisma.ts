import { PrismaClient } from "@prisma/client"

// PrismaClient is instantiated once and reused across the application
// This prevents multiple connections to the database, which can lead to performance issues
// and connection limits being exceeded.

// Declare a global variable for PrismaClient to avoid hot-reloading issues in development
declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined
}

let prisma: PrismaClient

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient()
} else {
  // In development, use the global variable to preserve the client across hot-reloads
  if (!global.prismaGlobal) {
    global.prismaGlobal = new PrismaClient()
  }
  prisma = global.prismaGlobal
}

export { prisma }
