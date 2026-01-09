import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { generateSlug } from "@/lib/utils"
import bcrypt from "bcryptjs"
import { z } from "zod"

const registerSchema = z.object({
  companyName: z.string().min(1),
  adminName: z.string().min(1),
  adminEmail: z.string().email(),
  adminPassword: z.string().min(6),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { companyName, adminName, adminEmail, adminPassword } = registerSchema.parse(body)

    // Generate unique slug
    let slug = generateSlug(companyName)
    let slugExists = await prisma.company.findUnique({ where: { slug } })
    let counter = 1
    while (slugExists) {
      slug = `${generateSlug(companyName)}-${counter}`
      slugExists = await prisma.company.findUnique({ where: { slug } })
      counter++
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: adminEmail },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(adminPassword, 10)

    // Create company and admin user
    const company = await prisma.company.create({
      data: {
        name: companyName,
        slug,
        users: {
          create: {
            email: adminEmail,
            password: hashedPassword,
            name: adminName,
            role: "ADMIN",
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      company: {
        id: company.id,
        name: company.name,
        slug: company.slug,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      )
    }
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Registration failed" },
      { status: 500 }
    )
  }
}
