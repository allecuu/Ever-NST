"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { ShoppingCart, Search, Menu, User, ChevronDown, LogOut } from "lucide-react"
import { useCartStore } from "@/store/cart"
import MobileMenu from "./MobileMenu"

export default function Header() {
  const { data: session } = useSession()
  const { itemCount, openCart } = useCartStore()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<{ id: string; name: string; slug: string }[]>([])
  const [searchOpen, setSearchOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [mounted, setMounted] = useState(false)
  const count = itemCount()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  function handleSearch(value: string) {
    setSearchQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!value.trim()) { setSearchResults([]); setSearchOpen(false); return }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(value)}&limit=5`)
        const data = await res.json()
        setSearchResults(data.products ?? [])
        setSearchOpen(true)
      } catch { setSearchResults([]) }
    }, 300)
  }

  return (
    <>
      <header className={`sticky top-0 z-50 bg-white transition-shadow duration-200 ${scrolled ? "shadow-md" : "shadow-sm"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">

            {/* Logo */}
            <Link href="/" className="shrink-0">
              <span className="text-xl font-bold text-[#2F4F4F]" style={{ fontFamily: "var(--font-poppins)" }}>
                Ever<span className="text-[#6B8E23]">nest</span>
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-6">
              {[["Produse", "/products"], ["Despre", "/about"], ["Contact", "/contact"]].map(
                ([label, href]) => (
                  <Link key={href} href={href}
                    className="text-sm font-medium text-gray-700 hover:text-[#6B8E23] transition-colors">
                    {label}
                  </Link>
                )
              )}
            </nav>

            {/* Search */}
            <div ref={searchRef} className="relative hidden sm:block flex-1 max-w-xs">
              <div className="flex items-center border border-gray-200 rounded-full px-3 py-1.5 gap-2 focus-within:border-[#6B8E23] transition-colors">
                <Search size={14} className="text-gray-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Caută produse..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="text-sm outline-none w-full bg-transparent placeholder:text-gray-400"
                />
              </div>
              {searchOpen && searchResults.length > 0 && (
                <div className="absolute top-full mt-2 left-0 right-0 bg-white border border-gray-100 rounded-xl shadow-lg py-2 z-50">
                  {searchResults.map((p) => (
                    <Link key={p.id} href={`/products/${p.slug}`}
                      onClick={() => { setSearchOpen(false); setSearchQuery("") }}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-[#f0f4e8] hover:text-[#6B8E23] transition-colors">
                      {p.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-1 shrink-0">
              {/* Cart */}
              <button onClick={openCart} aria-label="Coș"
                className="relative p-2 rounded-full hover:bg-gray-100 transition-colors">
                <ShoppingCart size={20} className="text-gray-700" />
                {mounted && count > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-[#6B8E23] text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 leading-none">
                    {count}
                  </span>
                )}
              </button>

              {/* User menu */}
              {session ? (
                <div className="relative hidden sm:block">
                  <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-1 p-2 rounded-full hover:bg-gray-100 transition-colors">
                    <User size={18} className="text-gray-700" />
                    <ChevronDown size={13} className="text-gray-500" />
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg py-2 z-50">
                      <p className="px-4 py-1.5 text-xs text-gray-400 truncate">{session.user?.email}</p>
                      <hr className="my-1 border-gray-100" />
                      <Link href="/account" onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        <User size={14} /> Contul meu
                      </Link>
                      {session.user?.role === "ADMIN" && (
                        <Link href="/admin" onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                          Admin
                        </Link>
                      )}
                      <hr className="my-1 border-gray-100" />
                      <button onClick={() => signOut({ callbackUrl: "/" })}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-gray-50 w-full">
                        <LogOut size={14} /> Deconectare
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link href="/login"
                  className="hidden sm:flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-[#6B8E23] border border-[#6B8E23] rounded-full hover:bg-[#f0f4e8] transition-colors">
                  <User size={14} /> Cont
                </Link>
              )}

              {/* Mobile hamburger */}
              <button onClick={() => setMobileOpen(true)} aria-label="Meniu"
                className="md:hidden p-2 rounded-full hover:bg-gray-100 transition-colors">
                <Menu size={20} className="text-gray-700" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <MobileMenu isOpen={mobileOpen} onClose={() => setMobileOpen(false)} session={session} />
    </>
  )
}
