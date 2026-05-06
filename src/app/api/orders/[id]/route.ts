import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { auth, requireAdmin } from "@/lib/auth"
import { orderStatusSchema } from "@/lib/validations"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params

  const { data: order } = await supabaseAdmin
    .from("Order")
    .select("*, items:OrderItem(*, product:Product(*)), user:User(id, name, email)")
    .eq("id", id)
    .maybeSingle()

  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 })

  if (session.user.role !== "ADMIN" && order.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  return NextResponse.json(order)
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin()
  if (error) return error

  const { id } = await params
  const body = await req.json()
  const parsed = orderStatusSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { data: order, error: updateError } = await supabaseAdmin
    .from("Order")
    .update({ status: parsed.data.status, updatedAt: new Date().toISOString() })
    .eq("id", id)
    .select("*, items:OrderItem(*)")
    .single()

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json(order)
}
