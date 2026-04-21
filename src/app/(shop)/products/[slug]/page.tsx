import { notFound } from "next/navigation"
import Link from "next/link"
import type { Metadata } from "next"
import { prisma } from "@/lib/prisma"
import ProductGallery from "@/components/products/ProductGallery"
import AddToCartButton from "@/components/products/AddToCartButton"
import ProductGrid from "@/components/products/ProductGrid"
import { Check, Minus, Plus } from "lucide-react"
import { Suspense } from "react"
import QuantitySelector from "./QuantitySelector"

async function getProduct(slug: string) {
  try {
    return await prisma.product.findFirst({
      where: { OR: [{ slug }, { id: slug }], isActive: true },
      include: { category: true },
    })
  } catch { return null }
}

async function getRelated(categoryId: string, excludeId: string) {
  try {
    return await prisma.product.findMany({
      where: { categoryId, id: { not: excludeId }, isActive: true },
      take: 4,
      include: { category: true },
    })
  } catch { return [] }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const product = await getProduct(slug)
  if (!product) return { title: "Produs negăsit" }
  return {
    title: product.name,
    description: product.description ?? `Cumpără ${product.name} de la Evernest`,
    openGraph: {
      title: product.name,
      description: product.description ?? undefined,
      images: product.images[0] ? [{ url: product.images[0] }] : [],
    },
  }
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await getProduct(slug)
  if (!product) notFound()

  const related = await getRelated(product.categoryId, product.id)
  const price = parseFloat(String(product.price))

  return (
    <div className="bg-[#f9f6f1] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Breadcrumbs */}
        <nav className="text-sm text-gray-500 mb-8 flex items-center gap-2 flex-wrap">
          <Link href="/" className="hover:text-[#6B8E23] transition-colors">Acasă</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-[#6B8E23] transition-colors">Produse</Link>
          {product.category && (
            <>
              <span>/</span>
              <Link href={`/categories/${product.category.slug}`} className="hover:text-[#6B8E23] transition-colors">
                {product.category.name}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-gray-900 font-medium line-clamp-1">{product.name}</span>
        </nav>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Gallery */}
          <ProductGallery images={product.images} name={product.name} />

          {/* Details */}
          <div className="space-y-6">
            {product.category && (
              <Link href={`/categories/${product.category.slug}`}
                className="text-xs font-semibold uppercase tracking-widest text-[#6B8E23] hover:underline">
                {product.category.name}
              </Link>
            )}

            <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: "var(--font-poppins)" }}>
              {product.name}
            </h1>

            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-gray-900">{price.toFixed(2)}</span>
              <span className="text-xl text-gray-500">LEI</span>
            </div>

            {/* Stock badge */}
            <div className="flex items-center gap-2">
              {product.stock > 0 ? (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" />
                  <span className="text-sm text-green-700 font-medium">
                    {product.stock <= 5 ? `Doar ${product.stock} în stoc` : "În stoc"}
                  </span>
                </>
              ) : (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block" />
                  <span className="text-sm text-red-600 font-medium">Stoc epuizat</span>
                </>
              )}
            </div>

            {/* Add to cart */}
            <Suspense>
              <QuantitySelector product={{ ...product, price }} />
            </Suspense>

            {/* Features */}
            {product.features.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
                <h3 className="text-sm font-semibold text-gray-800">Caracteristici</h3>
                <ul className="space-y-2">
                  {product.features.map((f: string, i: number) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
                      <Check size={15} className="text-[#6B8E23] shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Delivery info */}
            <div className="text-sm text-gray-500 space-y-1.5 border-t border-gray-100 pt-4">
              <p>🚚 Livrare gratuită la comenzi peste <strong>500 LEI</strong></p>
              <p>↩️ Retur gratuit în <strong>30 de zile</strong></p>
            </div>
          </div>
        </div>

        {/* Description */}
        {product.description && (
          <section className="bg-white rounded-2xl border border-gray-100 p-8 mb-16">
            <h2 className="text-xl font-bold text-gray-900 mb-4" style={{ fontFamily: "var(--font-poppins)" }}>
              Descriere produs
            </h2>
            <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed whitespace-pre-line">
              {product.description}
            </div>
          </section>
        )}

        {/* Related products */}
        {related.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-6" style={{ fontFamily: "var(--font-poppins)" }}>
              Produse similare
            </h2>
            <ProductGrid products={related} />
          </section>
        )}
      </div>
    </div>
  )
}
