import { NextRequest, NextResponse } from "next/server"
import { getCompanyFromSlug } from "@/lib/access-control"
import { prisma } from "@/lib/prisma"

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string; conversationId: string } }
) {
  try {
    const company = await getCompanyFromSlug(params.slug)
    const { searchParams } = new URL(req.url)
    const deviceId = searchParams.get("deviceId")

    const conversation = await prisma.conversation.findUnique({
      where: { id: params.conversationId },
      include: {
        customer: true,
        messages: {
          select: {
            id: true,
            content: true,
            imageUrl: true,
            senderType: true,
            senderId: true,
            createdAt: true,
          },
          orderBy: { createdAt: "asc" },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
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

    // Verify conversation belongs to company
    if (conversation.companyId !== company.id) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      )
    }

    // Verify deviceId matches if provided
    if (deviceId && conversation.customer.deviceId !== deviceId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      )
    }

    return NextResponse.json({ conversation })
  } catch (error) {
    console.error("Get conversation error:", error)
    return NextResponse.json(
      { error: "Failed to fetch conversation" },
      { status: 500 }
    )
  }
}
