"use client"

import Image from "next/image"
import Link from "next/link"
import { Minus, Plus, Trash2 } from "lucide-react"
import { useCartStore, type CartItem as CartItemType } from "@/store/cart"

export default function CartItem({ item }: { item: CartItemType }) {
  const { updateQuantity, removeItem } = useCartStore()

  return (
    <div className="flex gap-3">
      {/* Image */}
      <Link href={`/products/${item.slug}`} className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-gray-100">
        {item.image ? (
          <Image src={item.image} alt={item.name} fill className="object-cover" sizes="64px" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-xl">🪴</div>
        )}
      </Link>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <Link href={`/products/${item.slug}`} className="text-sm font-medium text-gray-900 hover:text-[#6B8E23] line-clamp-2 leading-snug">
          {item.name}
        </Link>
        <p className="text-sm text-[#6B8E23] font-semibold mt-0.5">{(item.price * item.quantity).toFixed(2)} LEI</p>

        {/* Qty controls */}
        <div className="flex items-center gap-2 mt-2">
          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => updateQuantity(item.id, item.quantity - 1)}
              className="p-1 hover:bg-gray-100 transition-colors"
              aria-label="Scade cantitatea"
            >
              <Minus size={12} className="text-gray-600" />
            </button>
            <span className="px-2.5 text-sm font-medium text-gray-800 min-w-[28px] text-center">{item.quantity}</span>
            <button
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
              className="p-1 hover:bg-gray-100 transition-colors"
              aria-label="Crește cantitatea"
            >
              <Plus size={12} className="text-gray-600" />
            </button>
          </div>
          <button
            onClick={() => removeItem(item.id)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors ml-auto"
            aria-label="Șterge"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}
