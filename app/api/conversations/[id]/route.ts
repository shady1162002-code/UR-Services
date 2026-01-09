import { NextRequest, NextResponse } from "next/server"
import { requireAuth, requireCompanyAccess } from "@/lib/access-control"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const assignSchema = z.object({
  userId: z.string().nullable(),
})

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await requireAuth()
    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            blocked: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        messages: {
          orderBy: { createdAt: "asc" },
          select: {
            id: true,
            content: true,
            imageUrl: true,
            senderType: true,
            senderId: true,
            createdAt: true,
          },
        },
      },
    })

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      )
    }

    await requireCompanyAccess(conversation.companyId)

    return NextResponse.json({ conversation })
  } catch (error) {
    console.error("Fetch conversation error:", error)
    return NextResponse.json(
      { error: "Failed to fetch conversation" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await requireAuth()
    const body = await req.json()
    const { userId } = assignSchema.parse(body)

    const conversation = await prisma.conversation.findUnique({
      where: { id },
    })

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      )
    }

    await requireCompanyAccess(conversation.companyId)

    // Verify user belongs to same company
    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      })
      if (!user || user.companyId !== session.user.companyId) {
        return NextResponse.json(
          { error: "Invalid user" },
          { status: 400 }
        )
      }
    }

    const updated = await prisma.conversation.update({
      where: { id },
      data: {
        userId: userId || null,
        status: userId ? "ASSIGNED" : "OPEN",
      },
      include: {
        customer: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json({ conversation: updated })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      )
    }
    console.error("Update conversation error:", error)
    return NextResponse.json(
      { error: "Failed to update conversation" },
      { status: 500 }
    )
  }
}
