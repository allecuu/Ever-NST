import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { requireAdmin } from "@/lib/auth"
import { productUpdateSchema } from "@/lib/validations"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const { data: products } = await supabaseAdmin
    .from("Product")
    .select("*, category:Category(*)")
    .or(`id.eq.${id},slug.eq.${id}`)
    .eq("isActive", true)
    .limit(1)

  const product = products?.[0] ?? null
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(product)
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin()
  if (error) return error

  const { id } = await params
  const body = await req.json()
  const parsed = productUpdateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { data: product, error: updateError } = await supabaseAdmin
    .from("Product")
    .update({ ...parsed.data, updatedAt: new Date().toISOString() })
    .eq("id", id)
    .select("*, category:Category(*)")
    .single()

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json(product)
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin()
  if (error) return error

  const { id } = await params
  const hard = req.nextUrl.searchParams.get("hard") === "true"

  if (hard) {
    await supabaseAdmin.from("Product").delete().eq("id", id)
    return NextResponse.json({ deleted: true })
  }

  const { data: product, error: updateError } = await supabaseAdmin
    .from("Product")
    .update({ isActive: false, updatedAt: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json(product)
}
