import type { DefaultSession } from "next-auth"
import type { UserRole } from "@prisma/client" // Assuming UserRole enum from Prisma

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      id: string
      role: UserRole // Add role to user object
      teamId?: string | null // Add teamId
      department?: string | null // Add department
    } & DefaultSession["user"]
  }

  interface User {
    role: UserRole
    teamId?: string | null
    department?: string | null
  }
}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    id: string
    role: UserRole
    teamId?: string | null
    department?: string | null
  }
}
