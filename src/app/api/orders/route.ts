import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { orderSchema } from "@/lib/validations"

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const isAdmin = session.user.role === "ADMIN"

  const orders = await prisma.order.findMany({
    where: isAdmin ? {} : { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      items: { include: { product: { select: { id: true, name: true, images: true } } } },
      ...(isAdmin && { user: { select: { id: true, name: true, email: true } } }),
    },
  })

  return NextResponse.json(orders)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const parsed = orderSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { items, address, phone, notes } = parsed.data

  const productIds = items.map((i) => i.productId)
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, isActive: true },
  })

  if (products.length !== productIds.length) {
    return NextResponse.json({ error: "Unul sau mai multe produse nu există" }, { status: 400 })
  }

  for (const item of items) {
    const product = products.find((p: { id: string }) => p.id === item.productId)!
    if (product.stock < item.quantity) {
      return NextResponse.json(
        { error: `Stoc insuficient pentru "${product.name}"` },
        { status: 400 }
      )
    }
  }

  const total = items.reduce((sum, item) => {
    const product = products.find((p: { id: string; price: unknown }) => p.id === item.productId)!
    return sum + Number(product.price) * item.quantity
  }, 0)

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        userId: session.user.id,
        total,
        address,
        phone,
        notes,
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: Number(products.find((p: { id: string; price: unknown }) => p.id === item.productId)!.price),
          })),
        },
      },
      include: { items: true },
    })

    for (const item of items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      })
    }

    return created
  })

  return NextResponse.json(order, { status: 201 })
}
