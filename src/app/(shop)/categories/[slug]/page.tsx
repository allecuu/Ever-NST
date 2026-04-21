import { notFound } from "next/navigation"
import Link from "next/link"
import type { Metadata } from "next"
import { prisma } from "@/lib/prisma"
import ProductGrid from "@/components/products/ProductGrid"

async function getCategory(slug: string) {
  try {
    return await prisma.category.findFirst({
      where: { OR: [{ slug }, { id: slug }] },
      include: {
        products: {
          where: { isActive: true },
          orderBy: { createdAt: "desc" },
          include: { category: true },
        },
      },
    })
  } catch { return null }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const cat = await getCategory(slug)
  if (!cat) return { title: "Categorie negăsită" }
  return { title: cat.name, description: cat.description ?? `Produse din categoria ${cat.name}` }
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const category = await getCategory(slug)
  if (!category) notFound()

  return (
    <div className="bg-[#f9f6f1] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <nav className="text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-[#6B8E23]">Acasă</Link>
          <span className="mx-2">/</span>
          <Link href="/categories" className="hover:text-[#6B8E23]">Categorii</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900 font-medium">{category.name}</span>
        </nav>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: "var(--font-poppins)" }}>
            {category.name}
          </h1>
          {category.description && (
            <p className="mt-2 text-gray-500">{category.description}</p>
          )}
          <p className="mt-1 text-sm text-gray-400">{category.products.length} produse</p>
        </div>

        <ProductGrid products={category.products} />
      </div>
    </div>
  )
}
