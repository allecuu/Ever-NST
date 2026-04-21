"use client"

import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useEffect, useRef, useState, useCallback } from "react"
import { Search, SlidersHorizontal, X } from "lucide-react"

type Category = { id: string; name: string; slug: string }

type Props = {
  categories: Category[]
}

export default function ProductFilters({ categories }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [search, setSearch] = useState(searchParams.get("search") ?? "")
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") ?? "")
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") ?? "")
  const [inStock, setInStock] = useState(searchParams.get("inStock") === "true")
  const [filtersOpen, setFiltersOpen] = useState(false)

  const activeCategory = searchParams.get("category") ?? ""
  const activeSort = searchParams.get("sort") ?? "newest"

  const pushParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString())
      Object.entries(updates).forEach(([key, val]) => {
        if (val === null || val === "") params.delete(key)
        else params.set(key, val)
      })
      params.delete("page")
      router.push(`${pathname}?${params.toString()}`)
    },
    [router, pathname, searchParams]
  )

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      pushParams({ search: search || null })
    }, 300)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [search]) // eslint-disable-line react-hooks/exhaustive-deps

  const hasActiveFilters = activeCategory || searchParams.get("minPrice") || searchParams.get("maxPrice") || searchParams.get("inStock")

  function clearAll() {
    setSearch("")
    setMinPrice("")
    setMaxPrice("")
    setInStock(false)
    router.push(pathname)
  }

  return (
    <div className="space-y-6">
      {/* Search + Sort row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Caută produse..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-[#6B8E23] focus:ring-2 focus:ring-[#6B8E23]/10 transition-colors"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Sort */}
        <select
          value={activeSort}
          onChange={(e) => pushParams({ sort: e.target.value })}
          className="px-3 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-[#6B8E23] bg-white cursor-pointer"
        >
          <option value="newest">Cele mai noi</option>
          <option value="price_asc">Preț crescător</option>
          <option value="price_desc">Preț descrescător</option>
        </select>

        {/* Mobile filters toggle */}
        <button
          onClick={() => setFiltersOpen(!filtersOpen)}
          className="sm:hidden flex items-center gap-2 px-4 py-2.5 text-sm border border-gray-200 rounded-xl hover:bg-gray-50"
        >
          <SlidersHorizontal size={14} />
          Filtre {hasActiveFilters && <span className="w-2 h-2 bg-[#6B8E23] rounded-full" />}
        </button>
      </div>

      {/* Filters panel */}
      <div className={`sm:block space-y-5 ${filtersOpen ? "block" : "hidden"}`}>
        {/* Clear all */}
        {hasActiveFilters && (
          <button onClick={clearAll} className="flex items-center gap-1.5 text-sm text-[#6B8E23] hover:underline">
            <X size={13} /> Resetează filtrele
          </button>
        )}

        {/* Categories */}
        <div>
          <h3 className="text-sm font-semibold text-gray-800 mb-3">Categorie</h3>
          <div className="space-y-1.5">
            <button
              onClick={() => pushParams({ category: null })}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${!activeCategory ? "bg-[#6B8E23] text-white font-medium" : "text-gray-600 hover:bg-gray-100"}`}
            >
              Toate categoriile
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => pushParams({ category: cat.slug })}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${activeCategory === cat.slug ? "bg-[#6B8E23] text-white font-medium" : "text-gray-600 hover:bg-gray-100"}`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Price range */}
        <div>
          <h3 className="text-sm font-semibold text-gray-800 mb-3">Interval preț (LEI)</h3>
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              onBlur={() => pushParams({ minPrice: minPrice || null })}
              onKeyDown={(e) => e.key === "Enter" && pushParams({ minPrice: minPrice || null })}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#6B8E23]"
            />
            <span className="text-gray-400 shrink-0">–</span>
            <input
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              onBlur={() => pushParams({ maxPrice: maxPrice || null })}
              onKeyDown={(e) => e.key === "Enter" && pushParams({ maxPrice: maxPrice || null })}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#6B8E23]"
            />
          </div>
        </div>

        {/* In stock */}
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={inStock}
            onChange={(e) => {
              setInStock(e.target.checked)
              pushParams({ inStock: e.target.checked ? "true" : null })
            }}
            className="w-4 h-4 accent-[#6B8E23] rounded"
          />
          <span className="text-sm text-gray-700">Doar produse în stoc</span>
        </label>
      </div>
    </div>
  )
}
