import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { auth } from "@/lib/auth"
import { orderSchema } from "@/lib/validations"
import { randomUUID } from "node:crypto"

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const isAdmin = session.user.role === "ADMIN"

  let query = supabaseAdmin
    .from("Order")
    .select(
      isAdmin
        ? "*, items:OrderItem(*, product:Product(id, name, images)), user:User(id, name, email)"
        : "*, items:OrderItem(*, product:Product(id, name, images))"
    )
    .order("createdAt", { ascending: false })

  if (!isAdmin) {
    query = query.eq("userId", session.user.id)
  }

  const { data: orders } = await query
  return NextResponse.json(orders ?? [])
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

  const { data: products } = await supabaseAdmin
    .from("Product")
    .select("id, name, price, stock")
    .in("id", productIds)
    .eq("isActive", true)

  if (!products || products.length !== productIds.length) {
    return NextResponse.json({ error: "Unul sau mai multe produse nu există" }, { status: 400 })
  }

  for (const item of items) {
    const product = products.find((p) => p.id === item.productId)!
    if (product.stock < item.quantity) {
      return NextResponse.json(
        { error: `Stoc insuficient pentru "${product.name}"` },
        { status: 400 }
      )
    }
  }

  const total = items.reduce((sum, item) => {
    const product = products.find((p) => p.id === item.productId)!
    return sum + Number(product.price) * item.quantity
  }, 0)

  const now = new Date().toISOString()
  const orderId = randomUUID()

  const { data: order, error: orderError } = await supabaseAdmin
    .from("Order")
    .insert({
      id: orderId,
      userId: session.user.id,
      total,
      address,
      phone: phone ?? null,
      notes: notes ?? null,
      status: "PENDING",
      createdAt: now,
      updatedAt: now,
    })
    .select()
    .single()

  if (orderError || !order) {
    return NextResponse.json({ error: "Eroare la plasarea comenzii" }, { status: 500 })
  }

  const orderItems = items.map((item) => ({
    id: randomUUID(),
    orderId,
    productId: item.productId,
    quantity: item.quantity,
    price: Number(products.find((p) => p.id === item.productId)!.price),
    createdAt: now,
  }))

  const { error: itemsError } = await supabaseAdmin.from("OrderItem").insert(orderItems)

  if (itemsError) {
    await supabaseAdmin.from("Order").delete().eq("id", orderId)
    return NextResponse.json({ error: "Eroare la plasarea comenzii" }, { status: 500 })
  }

  for (const item of items) {
    const product = products.find((p) => p.id === item.productId)!
    await supabaseAdmin
      .from("Product")
      .update({ stock: product.stock - item.quantity, updatedAt: now })
      .eq("id", item.productId)
  }

  return NextResponse.json({ ...order, items: orderItems }, { status: 201 })
}
