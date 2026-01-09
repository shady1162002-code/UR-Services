import { NextRequest, NextResponse } from "next/server"
import { getCompanyFromSlug } from "@/lib/access-control"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const createConversationSchema = z.object({
  customerName: z.string().min(1),
  customerEmail: z.string().email().optional(),
  deviceId: z.string().optional(),
})

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const company = await getCompanyFromSlug(params.slug)
    const { searchParams } = new URL(req.url)
    const deviceId = searchParams.get("deviceId")

    // If deviceId is provided, fetch previous conversations
    if (deviceId) {
      const customer = await prisma.customer.findFirst({
        where: {
          companyId: company.id,
          deviceId: deviceId,
        },
      })

      if (customer) {
        const conversations = await prisma.conversation.findMany({
          where: {
            customerId: customer.id,
            companyId: company.id,
          },
          include: {
            messages: {
              select: {
                id: true,
                content: true,
                imageUrl: true,
                senderType: true,
                createdAt: true,
              },
              orderBy: { createdAt: "desc" },
              take: 1,
            },
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: { updatedAt: "desc" },
        })

        return NextResponse.json({
          company: { id: company.id, name: company.name, slug: company.slug },
          customer: {
            id: customer.id,
            name: customer.name,
            email: customer.email,
            blocked: customer.blocked,
          },
          conversations,
        })
      }
    }

    return NextResponse.json({ company: { id: company.id, name: company.name, slug: company.slug } })
  } catch (error) {
    console.error("Get company error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Company not found" },
      { status: 404 }
    )
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const company = await getCompanyFromSlug(params.slug)
    const body = await req.json()
    const { customerName, customerEmail, deviceId } = createConversationSchema.parse(body)

    // Find customer by deviceId first, then by email
    let customer = await prisma.customer.findFirst({
      where: {
        companyId: company.id,
        ...(deviceId ? { deviceId } : {}),
      },
    })

    // If not found by deviceId, try email
    if (!customer && customerEmail) {
      customer = await prisma.customer.findFirst({
        where: {
          companyId: company.id,
          email: customerEmail,
        },
      })
    }

    if (!customer) {
      // Create new customer
      customer = await prisma.customer.create({
        data: {
          name: customerName,
          email: customerEmail || null,
          deviceId: deviceId || null,
          companyId: company.id,
        },
      })
    } else {
      // Update customer info
      const updateData: any = {}
      if (customerName !== customer.name) updateData.name = customerName
      if (customerEmail && customerEmail !== customer.email) updateData.email = customerEmail
      if (deviceId && !customer.deviceId) updateData.deviceId = deviceId

      if (Object.keys(updateData).length > 0) {
        customer = await prisma.customer.update({
          where: { id: customer.id },
          data: updateData,
        })
      }
    }

    // Create conversation
    const conversation = await prisma.conversation.create({
      data: {
        companyId: company.id,
        customerId: customer.id,
        status: "OPEN",
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            blocked: true,
          },
        },
      },
    })

    return NextResponse.json({ conversation }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      )
    }
    console.error("Create conversation error:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to create conversation"
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
