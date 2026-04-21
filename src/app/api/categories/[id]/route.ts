import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/auth"
import { categorySchema } from "@/lib/validations"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const category = await prisma.category.findFirst({
    where: { OR: [{ id }, { slug: id }] },
    include: { products: { where: { isActive: true }, include: { category: true } } },
  })

  if (!category) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(category)
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin()
  if (error) return error

  const { id } = await params
  const body = await req.json()
  const parsed = categorySchema.partial().safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const category = await prisma.category.update({
    where: { id },
    data: parsed.data,
  })

  return NextResponse.json(category)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin()
  if (error) return error

  const { id } = await params

  await prisma.category.delete({ where: { id } })

  return NextResponse.json({ deleted: true })
}
