"use client"

import Link from "next/link"
import { useCartStore } from "@/store/cart"
import { FREE_SHIPPING_THRESHOLD } from "@/lib/utils"

export default function CartSummary() {
  const { total, items } = useCartStore()
  const subtotal = total()
  const freeShipping = subtotal >= FREE_SHIPPING_THRESHOLD
  const shipping = freeShipping ? 0 : 25
  const orderTotal = subtotal + shipping

  if (items.length === 0) return null

  return (
    <div className="bg-[#f9f6f1] rounded-2xl p-6 space-y-4">
      <h2 className="font-semibold text-gray-900 text-lg" style={{ fontFamily: "var(--font-poppins)" }}>
        Rezumat comandă
      </h2>

      <div className="space-y-2.5 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} produse)</span>
          <span>{subtotal.toFixed(2)} LEI</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Livrare</span>
          {freeShipping ? (
            <span className="text-[#6B8E23] font-medium">Gratuită</span>
          ) : (
            <span>{shipping.toFixed(2)} LEI</span>
          )}
        </div>
        {!freeShipping && (
          <p className="text-xs text-gray-500 bg-[#f0f4e8] rounded-lg px-3 py-2">
            Mai adaugă <strong className="text-[#6B8E23]">{(FREE_SHIPPING_THRESHOLD - subtotal).toFixed(2)} LEI</strong> pentru livrare gratuită
          </p>
        )}
      </div>

      <div className="flex justify-between font-semibold text-gray-900 text-base pt-2 border-t border-gray-200">
        <span>Total</span>
        <span>{orderTotal.toFixed(2)} LEI</span>
      </div>

      <Link href="/checkout"
        className="block w-full py-3 bg-[#6B8E23] text-white text-center font-semibold rounded-xl hover:bg-[#5a7a1c] transition-colors">
        Finalizează comanda
      </Link>
      <Link href="/products"
        className="block w-full py-2.5 text-sm text-center text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
        Continuă cumpărăturile
      </Link>
    </div>
  )
}
