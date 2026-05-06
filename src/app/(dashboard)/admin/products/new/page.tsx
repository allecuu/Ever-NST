import { supabaseAdmin } from "@/lib/supabase"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import ProductForm from "@/components/admin/ProductForm"
import type { Category } from "@/types"

export default async function NewProductPage() {
  const { data: raw } = await supabaseAdmin
    .from("Category")
    .select("id, name, slug, description, image, createdAt")
    .order("name", { ascending: true })

  const categories: Category[] = (raw ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description ?? undefined,
    image: c.image ?? undefined,
    createdAt: c.createdAt,
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/products"
          className="p-2 rounded-lg border text-gray-500 hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Produs nou</h1>
          <p className="text-gray-500 mt-0.5">Completează informațiile produsului</p>
        </div>
      </div>
      <ProductForm categories={categories} />
    </div>
  )
}
