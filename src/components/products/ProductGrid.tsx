import ProductCard from "./ProductCard"

type Product = {
  id: string
  name: string
  slug: string
  price: number | string | { toString(): string }
  stock: number
  images: string[]
  category?: { name: string } | null
}

type Props = {
  products: Product[]
  emptyMessage?: string
}

export default function ProductGrid({ products, emptyMessage = "Nu am găsit produse." }: Props) {
  if (products.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-4xl mb-4">🔍</p>
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
