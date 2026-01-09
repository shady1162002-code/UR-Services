import { NextRequest, NextResponse } from "next/server"
import { requireAuth, requireAdmin } from "@/lib/access-control"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

const createEmployeeSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["ADMIN", "AGENT"]),
})

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth()
    
    const employees = await prisma.user.findMany({
      where: { companyId: session.user.companyId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ employees })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch employees" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAdmin()
    const body = await req.json()
    const { name, email, password, role } = createEmployeeSchema.parse(body)

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const employee = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        companyId: session.user.companyId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ employee }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      )
    }
    console.error("Create employee error:", error)
    return NextResponse.json(
      { error: "Failed to create employee" },
      { status: 500 }
    )
  }
}
