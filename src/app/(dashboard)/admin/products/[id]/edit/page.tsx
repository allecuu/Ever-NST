import { supabaseAdmin } from "@/lib/supabase"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import ProductForm from "@/components/admin/ProductForm"
import type { Category, Product } from "@/types"

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [{ data: raw }, { data: categoriesRaw }] = await Promise.all([
    supabaseAdmin
      .from("Product")
      .select("*, category:Category(*)")
      .eq("id", id)
      .maybeSingle(),
    supabaseAdmin
      .from("Category")
      .select("id, name, slug, description, image, createdAt")
      .order("name", { ascending: true }),
  ])

  if (!raw) notFound()

  const product: Product & { category: Category } = {
    id: raw.id,
    name: raw.name,
    slug: raw.slug,
    description: raw.description ?? undefined,
    price: Number(raw.price),
    stock: raw.stock,
    images: raw.images,
    features: raw.features,
    categoryId: raw.categoryId,
    category: {
      id: raw.category.id,
      name: raw.category.name,
      slug: raw.category.slug,
      description: raw.category.description ?? undefined,
      image: raw.category.image ?? undefined,
      createdAt: raw.category.createdAt,
    },
    isActive: raw.isActive,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  }

  const categories: Category[] = (categoriesRaw ?? []).map((c) => ({
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
          <h1 className="text-2xl font-bold text-gray-900">Editează produs</h1>
          <p className="text-gray-500 mt-0.5">{product.name}</p>
        </div>
      </div>
      <ProductForm product={product} categories={categories} />
    </div>
  )
}
