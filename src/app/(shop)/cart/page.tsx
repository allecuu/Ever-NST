"use client"

import Link from "next/link"
import { useCartStore } from "@/store/cart"
import CartItem from "@/components/cart/CartItem"
import CartSummary from "@/components/cart/CartSummary"
import { ShoppingCart, ArrowLeft } from "lucide-react"

export default function CartPage() {
  const { items, clearCart } = useCartStore()

  return (
    <div className="bg-[#f9f6f1] min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-8">
          <Link href="/" className="hover:text-[#6B8E23]">Acasă</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900 font-medium">Coș</span>
        </nav>

        <h1 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3" style={{ fontFamily: "var(--font-poppins)" }}>
          <ShoppingCart className="text-[#6B8E23]" size={24} />
          Coșul tău
          {items.length > 0 && (
            <span className="text-base font-normal text-gray-400">({items.length} {items.length === 1 ? "produs" : "produse"})</span>
          )}
        </h1>

        {items.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-7xl mb-6">🛒</div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2" style={{ fontFamily: "var(--font-poppins)" }}>
              Coșul tău este gol
            </h2>
            <p className="text-gray-500 mb-8">Adaugă produse pentru a continua cumpărăturile.</p>
            <Link href="/products"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#6B8E23] text-white font-semibold rounded-xl hover:bg-[#5a7a1c] transition-colors">
              <ArrowLeft size={16} /> Explorează produsele
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Items */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
                {items.map((item) => (
                  <div key={item.id}>
                    <CartItem item={item} />
                  </div>
                ))}
              </div>
              <div className="flex justify-between">
                <Link href="/products"
                  className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#6B8E23] transition-colors">
                  <ArrowLeft size={14} /> Continuă cumpărăturile
                </Link>
                <button onClick={clearCart}
                  className="text-sm text-red-400 hover:text-red-600 transition-colors">
                  Golește coșul
                </button>
              </div>
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <CartSummary />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
