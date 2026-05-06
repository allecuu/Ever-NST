import Link from "next/link"
import { supabaseAdmin } from "@/lib/supabase"
import ProductGrid from "@/components/products/ProductGrid"
import { ArrowRight, Truck, RotateCcw, Headphones } from "lucide-react"

async function getFeaturedProducts() {
  try {
    const { data } = await supabaseAdmin
      .from("Product")
      .select("*, category:Category(*)")
      .eq("isActive", true)
      .order("createdAt", { ascending: false })
      .limit(4)
    return data ?? []
  } catch { return [] }
}

async function getCategories() {
  try {
    const { data } = await supabaseAdmin
      .from("Category")
      .select("id, name, slug, description")
      .order("name", { ascending: true })
      .limit(6)
    return data ?? []
  } catch { return [] }
}

const categoryIcons: Record<string, string> = {
  default: "🛋️",
  canapele: "🛋️",
  mese: "🪑",
  dormitor: "🛏️",
  decoratiuni: "🪴",
  iluminat: "💡",
  depozitare: "📦",
}

const perks = [
  { icon: Truck, title: "Livrare gratuită", desc: "Comenzi peste 500 LEI" },
  { icon: RotateCcw, title: "Retur 30 de zile", desc: "Fără întrebări" },
  { icon: Headphones, title: "Suport dedicat", desc: "Luni-Vineri 9-18" },
]

export default async function HomePage() {
  const [products, categories] = await Promise.all([getFeaturedProducts(), getCategories()])

  return (
    <div className="bg-[#f9f6f1]">
      {/* Hero */}
      <section
        className="relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1a3333 0%, #2F4F4F 40%, #6B8E23 100%)" }}
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-72 h-72 rounded-full border border-white/30" />
          <div className="absolute -bottom-20 -left-10 w-96 h-96 rounded-full border border-white/20" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-white/10" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-36 text-center text-white">
          <p className="text-[#9DC840] text-sm font-semibold uppercase tracking-widest mb-4">
            Colecția 2025
          </p>
          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6 max-w-3xl mx-auto"
            style={{ fontFamily: "var(--font-poppins)" }}>
            Transformă-ți casa în{" "}
            <span className="text-[#9DC840]">căminul</span> perfect
          </h1>
          <p className="text-lg text-white/70 mb-10 max-w-xl mx-auto">
            Mobilă și decorațiuni atent selecționate pentru fiecare colț al locuinței tale.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/products"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#6B8E23] text-white font-semibold rounded-full hover:bg-[#5a7a1c] transition-colors text-sm">
              Explorează produsele <ArrowRight size={16} />
            </Link>
            <Link href="/categories"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-white/10 text-white font-semibold rounded-full border border-white/20 hover:bg-white/20 transition-colors text-sm">
              Vezi categoriile
            </Link>
          </div>
        </div>
      </section>

      {/* Perks */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {perks.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#f0f4e8] flex items-center justify-center shrink-0">
                  <Icon size={18} className="text-[#6B8E23]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{title}</p>
                  <p className="text-xs text-gray-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-[#6B8E23] text-sm font-semibold uppercase tracking-wide mb-1">Colecții</p>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900" style={{ fontFamily: "var(--font-poppins)" }}>
                Explorează categoriile
              </h2>
            </div>
            <Link href="/categories" className="text-sm text-[#6B8E23] font-medium hover:underline flex items-center gap-1">
              Vezi toate <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <Link key={cat.id} href={`/categories/${cat.slug}`}
                className="group relative rounded-2xl overflow-hidden bg-white border border-gray-100 p-6 hover:border-[#6B8E23]/30 hover:shadow-md transition-all duration-200 flex flex-col items-center gap-3 text-center">
                <span className="text-4xl">{categoryIcons[cat.slug] ?? categoryIcons.default}</span>
                <h3 className="text-sm font-semibold text-gray-800 group-hover:text-[#6B8E23] transition-colors">
                  {cat.name}
                </h3>
                {cat.description && (
                  <p className="text-xs text-gray-500 line-clamp-2">{cat.description}</p>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-[#6B8E23] text-sm font-semibold uppercase tracking-wide mb-1">Selecție</p>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900" style={{ fontFamily: "var(--font-poppins)" }}>
              Produse recomandate
            </h2>
          </div>
          <Link href="/products" className="text-sm text-[#6B8E23] font-medium hover:underline flex items-center gap-1">
            Toate produsele <ArrowRight size={14} />
          </Link>
        </div>
        <ProductGrid products={products} emptyMessage="Produsele vor apărea după configurarea bazei de date." />
      </section>
    </div>
  )
}
