import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import ProductForm from "@/components/admin/ProductForm"
import type { Category } from "@/types"

export default async function NewProductPage() {
  const raw = await prisma.category.findMany({ orderBy: { name: "asc" } })
  const categories: Category[] = raw.map((c: typeof raw[0]) => ({
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
