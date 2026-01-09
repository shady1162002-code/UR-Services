import { NextRequest, NextResponse } from "next/server"
import { requireAuth, requireCompanyAccess } from "@/lib/access-control"
import { prisma } from "@/lib/prisma"

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth()
    
    const customer = await prisma.customer.findUnique({
      where: { id: params.id },
    })

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      )
    }

    await requireCompanyAccess(customer.companyId)

    // Only admins can delete chat history
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      )
    }

    // Delete all conversations and messages for this customer
    await prisma.conversation.deleteMany({
      where: { customerId: params.id },
    })

    return NextResponse.json({ 
      success: true,
      message: "Chat history deleted successfully" 
    })
  } catch (error) {
    console.error("Delete chat history error:", error)
    return NextResponse.json(
      { error: "Failed to delete chat history" },
      { status: 500 }
    )
  }
}
