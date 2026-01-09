import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/access-control"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth()
    const companyId = session.user.companyId

    // Get all analytics in parallel
    const [
      totalCustomers,
      blockedCustomers,
      totalConversations,
      activeConversations,
      closedConversations,
      totalMessages,
      recentCustomers,
    ] = await Promise.all([
      // Total customers
      prisma.customer.count({
        where: { companyId },
      }),
      // Blocked customers
      prisma.customer.count({
        where: { companyId, blocked: true },
      }),
      // Total conversations
      prisma.conversation.count({
        where: { companyId },
      }),
      // Active conversations (OPEN or ASSIGNED)
      prisma.conversation.count({
        where: {
          companyId,
          status: { in: ["OPEN", "ASSIGNED"] },
        },
      }),
      // Closed conversations
      prisma.conversation.count({
        where: {
          companyId,
          status: "CLOSED",
        },
      }),
      // Total messages
      prisma.message.count({
        where: {
          conversation: {
            companyId,
          },
        },
      }),
      // Recent customers (last 7 days)
      prisma.customer.count({
        where: {
          companyId,
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ])

    const analytics = {
      totalCustomers,
      totalConversations,
      activeConversations,
      closedConversations,
      blockedCustomers,
      totalMessages,
      recentCustomers,
    }

    return NextResponse.json({ analytics })
  } catch (error) {
    console.error("Fetch analytics error:", error)
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    )
  }
}
