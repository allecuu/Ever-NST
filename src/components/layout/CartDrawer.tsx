"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { X, ShoppingCart } from "lucide-react"
import { useCartStore } from "@/store/cart"
import CartItem from "@/components/cart/CartItem"

const FREE_SHIPPING_THRESHOLD = 500

export default function CartDrawer() {
  const { items, isOpen, closeCart, total } = useCartStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const orderTotal = mounted ? total() : 0
  const remaining = FREE_SHIPPING_THRESHOLD - orderTotal
  const cartItems = mounted ? items : []

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/40 z-50 transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={closeCart}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white z-50 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ShoppingCart size={18} className="text-[#6B8E23]" />
            <h2 className="font-semibold text-gray-900" style={{ fontFamily: "var(--font-poppins)" }}>
              Coșul tău
              {cartItems.length > 0 && (
                <span className="ml-2 text-sm font-normal text-gray-500">({cartItems.length} {cartItems.length === 1 ? "produs" : "produse"})</span>
              )}
            </h2>
          </div>
          <button onClick={closeCart} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <X size={18} className="text-gray-600" />
          </button>
        </div>

        {/* Free shipping bar */}
        {remaining > 0 && cartItems.length > 0 && (
          <div className="px-5 py-3 bg-[#f0f4e8] text-sm text-[#5a7a1c]">
            Mai adaugă <strong>{remaining.toFixed(2)} LEI</strong> pentru livrare gratuită
            <div className="mt-1.5 h-1.5 bg-[#d4e4a8] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#6B8E23] rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (orderTotal / FREE_SHIPPING_THRESHOLD) * 100)}%` }}
              />
            </div>
          </div>
        )}
        {remaining <= 0 && cartItems.length > 0 && (
          <div className="px-5 py-3 bg-[#f0f4e8] text-sm font-medium text-[#5a7a1c] flex items-center gap-2">
            🎉 Livrare gratuită inclusă!
          </div>
        )}

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <ShoppingCart size={48} className="text-gray-200" />
              <div>
                <p className="font-medium text-gray-500">Coșul este gol</p>
                <p className="text-sm text-gray-400 mt-1">Adaugă produse pentru a continua</p>
              </div>
              <button onClick={closeCart} className="mt-2 px-5 py-2 bg-[#6B8E23] text-white text-sm font-medium rounded-full hover:bg-[#5a7a1c] transition-colors">
                Continuă cumpărăturile
              </button>
            </div>
          ) : (
            cartItems.map((item) => <CartItem key={item.id} item={item} />)
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="border-t border-gray-100 px-5 py-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Subtotal</span>
              <span className="font-semibold text-gray-900">{orderTotal.toFixed(2)} LEI</span>
            </div>
            {remaining <= 0 && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Livrare</span>
                <span className="text-[#6B8E23] font-medium">Gratuită</span>
              </div>
            )}
            <Link href="/cart" onClick={closeCart}
              className="block w-full py-3 bg-[#6B8E23] text-white text-center font-semibold rounded-xl hover:bg-[#5a7a1c] transition-colors">
              Finalizează comanda
            </Link>
            <button onClick={closeCart}
              className="block w-full py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors">
              Continuă cumpărăturile
            </button>
          </div>
        )}
      </div>
    </>
  )
}

