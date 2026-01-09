import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/access-control"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth()
    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status")
    const assigned = searchParams.get("assigned")

    const where: any = {
      companyId: session.user.companyId,
    }

    if (status) {
      where.status = status
    }

    if (assigned === "true") {
      where.userId = { not: null }
    } else if (assigned === "false") {
      where.userId = null
    }

    const conversations = await prisma.conversation.findMany({
      where,
      include: {
        customer: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { updatedAt: "desc" },
    })

    return NextResponse.json({ conversations })
  } catch (error) {
    console.error("Fetch conversations error:", error)
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 }
    )
  }
}
