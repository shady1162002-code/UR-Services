import { NextRequest, NextResponse } from "next/server"
import { requireAuth, requireAdmin } from "@/lib/access-control"
import { prisma } from "@/lib/prisma"

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await requireAdmin()
    
    const employee = await prisma.user.findUnique({
      where: { id },
    })

    if (!employee) {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 }
      )
    }

    // Verify employee belongs to same company
    if (employee.companyId !== session.user.companyId) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      )
    }

    // Prevent deleting yourself
    if (employee.id === session.user.id) {
      return NextResponse.json(
        { error: "You cannot delete your own account" },
        { status: 400 }
      )
    }

    await prisma.user.delete({
      where: { id },
    })

    return NextResponse.json({ 
      success: true,
      message: "Employee deleted successfully" 
    })
  } catch (error) {
    console.error("Delete employee error:", error)
    return NextResponse.json(
      { error: "Failed to delete employee" },
      { status: 500 }
    )
  }
}
