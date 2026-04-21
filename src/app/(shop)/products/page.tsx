import { Suspense } from "react"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import ProductGrid from "@/components/products/ProductGrid"
import ProductFilters from "@/components/products/ProductFilters"
import { ChevronLeft, ChevronRight } from "lucide-react"

type SearchParams = { [key: string]: string | string[] | undefined }

function str(v: string | string[] | undefined) { return typeof v === "string" ? v : undefined }

async function getProducts(params: SearchParams) {
  const categorySlug = str(params.category)
  const search = str(params.search)
  const minPrice = str(params.minPrice)
  const maxPrice = str(params.maxPrice)
  const sort = str(params.sort) ?? "newest"
  const inStock = params.inStock === "true"
  const page = Math.max(1, Number(str(params.page) ?? "1"))
  const limit = 12

  let categoryId: string | undefined
  if (categorySlug) {
    const cat = await prisma.category.findUnique({ where: { slug: categorySlug } })
    categoryId = cat?.id
  }

  const where = {
    isActive: true,
    ...(categoryId && { categoryId }),
    ...(inStock && { stock: { gt: 0 } }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" as const } },
        { description: { contains: search, mode: "insensitive" as const } },
      ],
    }),
    ...((minPrice || maxPrice) && {
      price: {
        ...(minPrice && { gte: Number(minPrice) }),
        ...(maxPrice && { lte: Number(maxPrice) }),
      },
    }),
  }

  const orderBy =
    sort === "price_asc" ? { price: "asc" as const } :
    sort === "price_desc" ? { price: "desc" as const } :
    { createdAt: "desc" as const }

  try {
    const [products, total] = await Promise.all([
      prisma.product.findMany({ where, orderBy, skip: (page - 1) * limit, take: limit, include: { category: true } }),
      prisma.product.count({ where }),
    ])
    return { products, total, page, limit, totalPages: Math.ceil(total / limit) }
  } catch {
    return { products: [], total: 0, page: 1, limit, totalPages: 0 }
  }
}

async function getCategories() {
  try { return await prisma.category.findMany({ orderBy: { name: "asc" } }) }
  catch { return [] }
}

export default async function ProductsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams
  const [{ products, total, page, totalPages }, categories] = await Promise.all([
    getProducts(params),
    getCategories(),
  ])

  const sort = str(params.sort) ?? "newest"
  const currentPage = page

  function pageUrl(p: number) {
    const sp = new URLSearchParams()
    Object.entries(params).forEach(([k, v]) => { if (v && k !== "page") sp.set(k, String(v)) })
    if (p > 1) sp.set("page", String(p))
    const q = sp.toString()
    return `/products${q ? `?${q}` : ""}`
  }

  return (
    <div className="bg-[#f9f6f1] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-[#6B8E23]">Acasă</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900 font-medium">Produse</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-60 shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <Suspense>
                <ProductFilters categories={categories} />
              </Suspense>
            </div>
          </aside>

          {/* Main */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm text-gray-500">
                <span className="font-semibold text-gray-900">{total}</span> produse găsite
              </p>
            </div>

            <ProductGrid products={products} />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-2">
                {currentPage > 1 && (
                  <Link href={pageUrl(currentPage - 1)}
                    className="flex items-center gap-1 px-4 py-2 text-sm border border-gray-200 rounded-xl bg-white hover:border-[#6B8E23] hover:text-[#6B8E23] transition-colors">
                    <ChevronLeft size={15} /> Anterior
                  </Link>
                )}
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                    const p = currentPage <= 4 ? i + 1 :
                      currentPage >= totalPages - 3 ? totalPages - 6 + i :
                      currentPage - 3 + i
                    if (p < 1 || p > totalPages) return null
                    return (
                      <Link key={p} href={pageUrl(p)}
                        className={`w-9 h-9 flex items-center justify-center text-sm rounded-xl transition-colors ${p === currentPage ? "bg-[#6B8E23] text-white font-semibold" : "bg-white border border-gray-200 hover:border-[#6B8E23] hover:text-[#6B8E23]"}`}>
                        {p}
                      </Link>
                    )
                  })}
                </div>
                {currentPage < totalPages && (
                  <Link href={pageUrl(currentPage + 1)}
                    className="flex items-center gap-1 px-4 py-2 text-sm border border-gray-200 rounded-xl bg-white hover:border-[#6B8E23] hover:text-[#6B8E23] transition-colors">
                    Următor <ChevronRight size={15} />
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
