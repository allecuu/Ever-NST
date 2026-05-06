import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { requireAdmin } from "@/lib/auth"
import { categorySchema } from "@/lib/validations"
import { slugify } from "@/lib/utils"
import { randomUUID } from "node:crypto"

export async function GET() {
  const { data: categories } = await supabaseAdmin
    .from("Category")
    .select("*, products:Product(id)")
    .order("name", { ascending: true })

  const transformed = (categories ?? []).map(({ products, ...c }) => ({
    ...c,
    _count: { products: products?.length ?? 0 },
  }))

  return NextResponse.json(transformed)
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error

  const body = await req.json()
  const parsed = categorySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const slug = parsed.data.slug ?? slugify(parsed.data.name)
  const now = new Date().toISOString()

  const { data: category, error: insertError } = await supabaseAdmin
    .from("Category")
    .insert({ id: randomUUID(), ...parsed.data, slug, createdAt: now, updatedAt: now })
    .select()
    .single()

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  return NextResponse.json(category, { status: 201 })
}
