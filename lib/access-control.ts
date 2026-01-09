import { getServerSession } from "next-auth"
import { authOptions } from "./auth"
import { prisma } from "./prisma"

export async function requireAuth() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new Error("Unauthorized")
  }
  return session
}

export async function requireAdmin() {
  const session = await requireAuth()
  if (session.user.role !== "ADMIN") {
    throw new Error("Forbidden: Admin access required")
  }
  return session
}

export async function requireCompanyAccess(companyId: string) {
  const session = await requireAuth()
  if (session.user.companyId !== companyId) {
    throw new Error("Forbidden: Company access denied")
  }
  return session
}

export async function getCompanyFromSlug(slug: string) {
  const company = await prisma.company.findUnique({
    where: { slug },
  })
  if (!company) {
    throw new Error("Company not found")
  }
  return company
}
