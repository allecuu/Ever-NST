import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { requireAdmin } from "@/lib/auth"
import { blogPostSchema } from "@/lib/validations"
import { slugify } from "@/lib/utils"
import { randomUUID } from "node:crypto"

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const all = searchParams.get("all") === "true"
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"))
  const limit = Math.min(50, Number(searchParams.get("limit") ?? "9"))

  let query = supabaseAdmin
    .from("BlogPost")
    .select("id, title, slug, excerpt, coverImage, published, publishedAt, createdAt", { count: "exact" })
    .order("createdAt", { ascending: false })
    .range((page - 1) * limit, page * limit - 1)

  if (!all) query = query.eq("published", true)

  const { data: posts, count } = await query
  const total = count ?? 0

  return NextResponse.json({
    posts: posts ?? [],
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  })
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error

  const body = await req.json()
  const parsed = blogPostSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  let { slug } = parsed.data
  const { data: existing } = await supabaseAdmin
    .from("BlogPost")
    .select("id")
    .eq("slug", slug)
    .maybeSingle()

  if (existing) slug = `${slug}-${Date.now()}`

  const now = new Date().toISOString()
  const { data: post, error: insertError } = await supabaseAdmin
    .from("BlogPost")
    .insert({
      id: randomUUID(),
      ...parsed.data,
      slug,
      publishedAt: parsed.data.published ? now : null,
      createdAt: now,
      updatedAt: now,
    })
    .select()
    .single()

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  return NextResponse.json(post, { status: 201 })
}
