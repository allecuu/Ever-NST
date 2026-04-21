"use client"

import { useState } from "react"
import { ShoppingCart, Check } from "lucide-react"
import { useCartStore } from "@/store/cart"

type Props = {
  product: {
    id: string
    name: string
    price: number | string | { toString(): string }
    images: string[]
    slug: string
    stock: number
  }
  quantity?: number
}

export default function AddToCartButton({ product, quantity = 1 }: Props) {
  const { addItem, openCart } = useCartStore()
  const [added, setAdded] = useState(false)

  if (product.stock === 0) {
    return (
      <button disabled
        className="w-full py-2.5 rounded-xl bg-gray-100 text-gray-400 text-sm font-medium cursor-not-allowed">
        Stoc epuizat
      </button>
    )
  }

  function handleAdd() {
    addItem({
      id: product.id,
      name: product.name,
      price: parseFloat(String(product.price)),
      quantity,
      image: product.images[0],
      slug: product.slug,
    })
    setAdded(true)
    openCart()
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <button
      onClick={handleAdd}
      className={`w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 ${
        added
          ? "bg-green-500 text-white"
          : "bg-[#6B8E23] text-white hover:bg-[#5a7a1c] active:scale-95"
      }`}
    >
      {added ? (
        <><Check size={16} /> Adăugat!</>
      ) : (
        <><ShoppingCart size={16} /> Adaugă în coș</>
      )}
    </button>
  )
}
