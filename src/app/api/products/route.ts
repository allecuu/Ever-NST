import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { requireAdmin } from "@/lib/auth"
import { productSchema } from "@/lib/validations"
import { slugify } from "@/lib/utils"
import { randomUUID } from "node:crypto"

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const categoryId = searchParams.get("categoryId")
  const search = searchParams.get("search")
  const minPrice = searchParams.get("minPrice")
  const maxPrice = searchParams.get("maxPrice")
  const sort = searchParams.get("sort") ?? "newest"
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"))
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? "12")))

  let query = supabaseAdmin
    .from("Product")
    .select("*, category:Category(*)", { count: "exact" })
    .eq("isActive", true)

  if (categoryId) query = query.eq("categoryId", categoryId)
  if (search) query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
  if (minPrice) query = query.gte("price", Number(minPrice))
  if (maxPrice) query = query.lte("price", Number(maxPrice))

  if (sort === "price_asc") query = query.order("price", { ascending: true })
  else if (sort === "price_desc") query = query.order("price", { ascending: false })
  else query = query.order("createdAt", { ascending: false })

  query = query.range((page - 1) * limit, page * limit - 1)

  const { data: products, count } = await query
  const total = count ?? 0

  return NextResponse.json({
    products: products ?? [],
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  })
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error

  const body = await req.json()
  const parsed = productSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { name, ...rest } = parsed.data
  let slug = slugify(name)

  const { data: existing } = await supabaseAdmin
    .from("Product")
    .select("id")
    .eq("slug", slug)
    .maybeSingle()

  if (existing) slug = `${slug}-${Date.now()}`

  const now = new Date().toISOString()
  const { data: product, error: insertError } = await supabaseAdmin
    .from("Product")
    .insert({ id: randomUUID(), name, slug, ...rest, createdAt: now, updatedAt: now })
    .select("*, category:Category(*)")
    .single()

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  return NextResponse.json(product, { status: 201 })
}
