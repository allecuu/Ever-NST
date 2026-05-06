import Image from "next/image"
import Link from "next/link"
import AddToCartButton from "./AddToCartButton"

type Product = {
  id: string
  name: string
  slug: string
  price: number | string
  stock: number
  images: string[]
  category?: { name: string } | null
}

export default function ProductCard({ product }: { product: Product }) {
  const price = parseFloat(String(product.price))

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
      {/* Image */}
      <Link href={`/products/${product.slug}`} className="block relative aspect-[4/3] overflow-hidden bg-gray-50">
        {product.images[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl text-gray-200 bg-gradient-to-br from-gray-50 to-gray-100">
            🪴
          </div>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <span className="bg-white text-gray-700 text-xs font-semibold px-3 py-1 rounded-full">Stoc epuizat</span>
          </div>
        )}
        {product.stock > 0 && product.stock <= 5 && (
          <span className="absolute top-2 left-2 bg-orange-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
            Ultimele {product.stock}
          </span>
        )}
      </Link>

      {/* Info */}
      <div className="p-4 space-y-3">
        {product.category && (
          <p className="text-xs text-[#6B8E23] font-medium uppercase tracking-wide">{product.category.name}</p>
        )}
        <Link href={`/products/${product.slug}`}>
          <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 hover:text-[#6B8E23] transition-colors leading-snug">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-gray-900">{price.toFixed(2)} <span className="text-sm font-normal text-gray-500">LEI</span></span>
          {product.stock > 5 && (
            <span className="text-xs text-gray-400">În stoc</span>
          )}
        </div>
        <AddToCartButton product={{ ...product, price }} />
      </div>
    </div>
  )
}
