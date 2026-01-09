import { NextRequest, NextResponse } from "next/server"
import { requireAuth, requireCompanyAccess } from "@/lib/access-control"
import { prisma } from "@/lib/prisma"
import { getIO } from "@/lib/socket-server"
import { z } from "zod"

const createMessageSchema = z.object({
  conversationId: z.string(),
  content: z.string().optional(),
  imageUrl: z.string().optional(),
  senderType: z.enum(["CUSTOMER", "EMPLOYEE"]),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { conversationId, content, imageUrl, senderType } = createMessageSchema.parse(body)

    // Validate that either content or imageUrl is provided
    if (!content && !imageUrl) {
      return NextResponse.json(
        { error: "Either content or image is required" },
        { status: 400 }
      )
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { customer: true },
    })

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      )
    }

    // Check if customer is blocked (only for customer messages)
    if (senderType === "CUSTOMER" && conversation.customer.blocked) {
      return NextResponse.json(
        { error: "You have been blocked from sending messages" },
        { status: 403 }
      )
    }

    // If message is from employee, require auth and verify access
    if (senderType === "EMPLOYEE") {
      const session = await requireAuth()
      await requireCompanyAccess(conversation.companyId)
      
      // Verify employee is assigned or is admin
      if (conversation.userId && conversation.userId !== session.user.id) {
        const user = await prisma.user.findUnique({
          where: { id: session.user.id },
        })
        if (user?.role !== "ADMIN") {
          return NextResponse.json(
            { error: "Not assigned to this conversation" },
            { status: 403 }
          )
        }
      }
    }

    const message = await prisma.message.create({
      data: {
        conversationId,
        content: content || "",
        imageUrl: imageUrl || null,
        senderType,
        senderId: senderType === "EMPLOYEE" ? (await requireAuth()).user.id : null,
      },
      include: {
        conversation: {
          include: {
            customer: true,
          },
        },
      },
    })

    // Update conversation updatedAt
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    })

    // Emit socket event for real-time updates
    try {
      const io = getIO()
      if (io) {
        io.to(`conversation:${conversationId}`).emit("message-received", message)
      }
    } catch (error) {
      // Socket might not be initialized, that's okay
      console.log("Socket not available, skipping emit")
    }

    return NextResponse.json({ message }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      )
    }
    console.error("Create message error:", error)
    return NextResponse.json(
      { error: "Failed to create message" },
      { status: 500 }
    )
  }
}
