import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/access-control"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth()
    
    const customers = await prisma.customer.findMany({
      where: { companyId: session.user.companyId },
      select: {
        id: true,
        name: true,
        email: true,
        blocked: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ customers })
  } catch (error) {
    console.error("Fetch customers error:", error)
    return NextResponse.json(
      { error: "Failed to fetch customers" },
      { status: 500 }
    )
  }
}
