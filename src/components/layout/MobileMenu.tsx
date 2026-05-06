"use client"

import Link from "next/link"
import { X, User, LogOut, ShoppingCart } from "lucide-react"
import { signOut } from "next-auth/react"
import type { Session } from "next-auth"
import { useCartStore } from "@/store/cart"

type Props = {
  isOpen: boolean
  onClose: () => void
  session: Session | null | undefined
}

const navLinks = [
  { label: "Acasă", href: "/" },
  { label: "Produse", href: "/products" },
  { label: "Blog", href: "/blog" },
  { label: "Despre noi", href: "/about" },
  { label: "Contact", href: "/contact" },
]

export default function MobileMenu({ isOpen, onClose, session }: Props) {
  const { openCart } = useCartStore()

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/40 z-50 transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-white z-50 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <span className="text-lg font-bold text-[#2F4F4F]" style={{ fontFamily: "var(--font-poppins)" }}>
            Ever<span className="text-[#6B8E23]">nest</span>
          </span>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <X size={18} className="text-gray-600" />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto py-4">
          {navLinks.map(({ label, href }) => (
            <Link key={href} href={href} onClick={onClose}
              className="flex items-center px-6 py-3.5 text-base font-medium text-gray-700 hover:bg-[#f0f4e8] hover:text-[#6B8E23] transition-colors">
              {label}
            </Link>
          ))}
        </nav>

        {/* Bottom actions */}
        <div className="border-t border-gray-100 p-4 space-y-2">
          <button
            onClick={() => { openCart(); onClose() }}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-[#f0f4e8] text-[#6B8E23] font-medium text-sm hover:bg-[#e4ecd0] transition-colors"
          >
            <ShoppingCart size={17} /> Coș de cumpărături
          </button>

          {session ? (
            <>
              <Link href="/account" onClick={onClose}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-gray-50 text-gray-700 font-medium text-sm hover:bg-gray-100 transition-colors">
                <User size={17} /> Contul meu
              </Link>
              <button
                onClick={() => { signOut({ callbackUrl: "/" }); onClose() }}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-red-50 text-red-500 font-medium text-sm hover:bg-red-100 transition-colors"
              >
                <LogOut size={17} /> Deconectare
              </button>
            </>
          ) : (
            <Link href="/login" onClick={onClose}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#6B8E23] text-white font-semibold text-sm hover:bg-[#5a7a1c] transition-colors">
              <User size={17} /> Intră în cont
            </Link>
          )}
        </div>
      </div>
    </>
  )
}
