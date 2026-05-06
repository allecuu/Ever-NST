import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { requireAdmin } from "@/lib/auth"
import { blogPostUpdateSchema } from "@/lib/validations"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const { data: posts } = await supabaseAdmin
    .from("BlogPost")
    .select("*")
    .or(`id.eq.${id},slug.eq.${id}`)
    .limit(1)

  const post = posts?.[0] ?? null
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(post)
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin()
  if (error) return error

  const { id } = await params
  const body = await req.json()
  const parsed = blogPostUpdateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const now = new Date().toISOString()
  const update: Record<string, unknown> = { ...parsed.data, updatedAt: now }

  if (parsed.data.published === true) {
    const { data: current } = await supabaseAdmin
      .from("BlogPost")
      .select("publishedAt")
      .eq("id", id)
      .maybeSingle()
    if (!current?.publishedAt) update.publishedAt = now
  }
  if (parsed.data.published === false) {
    update.publishedAt = null
  }

  const { data: post, error: updateError } = await supabaseAdmin
    .from("BlogPost")
    .update(update)
    .eq("id", id)
    .select()
    .single()

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json(post)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin()
  if (error) return error

  const { id } = await params
  const { error: deleteError } = await supabaseAdmin.from("BlogPost").delete().eq("id", id)

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 })
  }

  return NextResponse.json({ deleted: true })
}
