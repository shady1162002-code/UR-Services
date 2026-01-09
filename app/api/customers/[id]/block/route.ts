import { NextRequest, NextResponse } from "next/server"
import { requireAuth, requireAdmin } from "@/lib/access-control"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await requireAuth()
    const body = await req.json()
    const { blocked } = body

    const customer = await prisma.customer.findUnique({
      where: { id },
    })

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      )
    }

    // Verify customer belongs to same company
    if (customer.companyId !== session.user.companyId) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      )
    }

    // Only admins can block/unblock
    if (session.user.role !== "ADMIN") {
      await requireAdmin()
    }

    const updated = await prisma.customer.update({
      where: { id },
      data: { blocked: blocked === true },
    })

    return NextResponse.json({ customer: updated })
  } catch (error) {
    console.error("Block customer error:", error)
    return NextResponse.json(
      { error: "Failed to update customer" },
      { status: 500 }
    )
  }
}
