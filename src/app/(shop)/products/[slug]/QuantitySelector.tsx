"use client"

import { useState } from "react"
import { Minus, Plus } from "lucide-react"
import AddToCartButton from "@/components/products/AddToCartButton"

type Props = {
  product: {
    id: string
    name: string
    price: number
    images: string[]
    slug: string
    stock: number
  }
}

export default function QuantitySelector({ product }: Props) {
  const [qty, setQty] = useState(1)
  const max = Math.min(product.stock, 99)

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-gray-700">Cantitate</span>
        <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            disabled={qty <= 1}
            className="p-2.5 hover:bg-gray-100 disabled:opacity-40 transition-colors"
          >
            <Minus size={14} className="text-gray-600" />
          </button>
          <span className="px-4 text-sm font-semibold text-gray-900 min-w-[44px] text-center">{qty}</span>
          <button
            onClick={() => setQty((q) => Math.min(max, q + 1))}
            disabled={qty >= max}
            className="p-2.5 hover:bg-gray-100 disabled:opacity-40 transition-colors"
          >
            <Plus size={14} className="text-gray-600" />
          </button>
        </div>
      </div>
      <AddToCartButton product={product} quantity={qty} />
    </div>
  )
}
