import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { registerSchema } from "@/lib/validations"
import bcrypt from "bcryptjs"
import { randomUUID } from "node:crypto"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = registerSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Date invalide" }, { status: 400 })
    }

    const { name, email, password } = parsed.data

    const { data: existing } = await supabaseAdmin
      .from("User")
      .select("id")
      .eq("email", email)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ error: "Există deja un cont cu acest email" }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)
    const now = new Date().toISOString()

    const { error } = await supabaseAdmin.from("User").insert({
      id: randomUUID(),
      name,
      email,
      password: hashedPassword,
      role: "USER",
      createdAt: now,
      updatedAt: now,
    })

    if (error) {
      console.error("[register]", error)
      return NextResponse.json({ error: "Eroare de server. Încearcă din nou." }, { status: 500 })
    }

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (err) {
    console.error("[register]", err)
    return NextResponse.json({ error: "Eroare de server. Încearcă din nou." }, { status: 500 })
  }
}
