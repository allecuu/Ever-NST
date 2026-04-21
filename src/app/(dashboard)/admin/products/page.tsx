import { prisma } from "@/lib/prisma"
import Link from "next/link"
import Image from "next/image"
import { Plus, Search } from "lucide-react"
import ProductActions from "@/components/admin/ProductActions"

interface SearchParams {
  search?: string
  categoryId?: string
  status?: string
  page?: string
}

const LIMIT = 20

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const sp = await searchParams
  const search = sp.search ?? ""
  const categoryId = sp.categoryId ?? ""
  const status = sp.status ?? "all"
  const page = Math.max(1, Number(sp.page ?? "1"))

  const where = {
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" as const } },
        { slug: { contains: search, mode: "insensitive" as const } },
      ],
    }),
    ...(categoryId && { categoryId }),
    ...(status === "active" && { isActive: true }),
    ...(status === "inactive" && { isActive: false }),
  }

  const [products, total, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * LIMIT,
      take: LIMIT,
      include: { category: { select: { name: true } } },
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ])

  const totalPages = Math.ceil(total / LIMIT)

  const buildUrl = (params: Record<string, string>) => {
    const q = new URLSearchParams({
      ...(search && { search }),
      ...(categoryId && { categoryId }),
      ...(status !== "all" && { status }),
      page: "1",
      ...params,
    })
    return `/admin/products?${q}`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Produse</h1>
          <p className="text-gray-500 mt-1">{total} produs(e) total</p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 px-4 py-2.5 text-white rounded-lg text-sm font-medium transition-colors hover:opacity-90"
          style={{ backgroundColor: "#6B8E23" }}
        >
          <Plus size={16} />
          Adaugă produs
        </Link>
      </div>

      <div className="bg-white rounded-xl border">
        <div className="p-4 border-b flex flex-wrap gap-3">
          <form className="flex items-center gap-2 flex-1 min-w-48">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                name="search"
                defaultValue={search}
                placeholder="Caută după nume sau slug..."
                className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6B8E23]/30 focus:border-[#6B8E23]"
              />
            </div>
            <input type="hidden" name="categoryId" value={categoryId} />
            <input type="hidden" name="status" value={status} />
            <button
              type="submit"
              className="px-3 py-2 border rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Caută
            </button>
          </form>

          <div className="flex gap-2">
            {["all", "active", "inactive"].map((s) => (
              <Link
                key={s}
                href={buildUrl({ status: s })}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  status === s
                    ? "text-white"
                    : "border text-gray-600 hover:bg-gray-50"
                }`}
                style={status === s ? { backgroundColor: "#6B8E23" } : {}}
              >
                {s === "all" ? "Toate" : s === "active" ? "Active" : "Inactive"}
              </Link>
            ))}
          </div>

          {categories.length > 0 && (
            <Link
              href={buildUrl({ categoryId: "" })}
              className="sr-only"
            >
              reset
            </Link>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-500">Produs</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Categorie</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Preț</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Stoc</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">Acțiuni</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                    Niciun produs găsit
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          {product.images[0] ? (
                            <Image
                              src={product.images[0]}
                              alt={product.name}
                              width={40}
                              height={40}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 leading-tight">{product.name}</p>
                          <p className="text-xs text-gray-400">{product.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{product.category.name}</td>
                    <td className="px-4 py-3 font-medium">
                      {Number(product.price).toLocaleString("ro-RO")} RON
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`font-medium ${product.stock === 0 ? "text-red-600" : product.stock <= 5 ? "text-orange-600" : "text-gray-900"}`}
                      >
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                          product.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {product.isActive ? "Activ" : "Inactiv"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end">
                        <ProductActions id={product.id} isActive={product.isActive} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="p-4 border-t flex items-center justify-between text-sm">
            <p className="text-gray-500">
              Pagina {page} din {totalPages}
            </p>
            <div className="flex gap-2">
              {page > 1 && (
                <Link
                  href={buildUrl({ page: String(page - 1) })}
                  className="px-3 py-1.5 border rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Anterior
                </Link>
              )}
              {page < totalPages && (
                <Link
                  href={buildUrl({ page: String(page + 1) })}
                  className="px-3 py-1.5 border rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Următor
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
