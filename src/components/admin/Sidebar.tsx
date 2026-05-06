"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { LayoutDashboard, Package, Tag, ShoppingCart, LogOut, Menu, X, BookOpen } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Produse", icon: Package, exact: false },
  { href: "/admin/categories", label: "Categorii", icon: Tag, exact: false },
  { href: "/admin/orders", label: "Comenzi", icon: ShoppingCart, exact: false },
  { href: "/admin/blog", label: "Blog", icon: BookOpen, exact: false },
]

function NavLinks({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname()

  return (
    <nav className="flex-1 p-4 space-y-1">
      {navItems.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            onClick={onClose}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              active
                ? "bg-white/20 text-white"
                : "text-white/70 hover:bg-white/10 hover:text-white"
            )}
          >
            <Icon size={18} />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  const SidebarContent = ({ onClose }: { onClose?: () => void }) => (
    <>
      <div className="p-6 border-b border-white/10">
        <Link href="/" className="text-xl font-bold text-white" style={{ fontFamily: "var(--font-poppins), sans-serif" }}>
          Evernest
        </Link>
        <p className="text-xs text-white/50 mt-0.5">Admin Panel</p>
      </div>
      <NavLinks onClose={onClose} />
      <div className="p-4 border-t border-white/10">
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition-colors"
        >
          <LogOut size={18} />
          Ieșire
        </button>
      </div>
    </>
  )

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg text-white shadow-lg"
        style={{ backgroundColor: "#2F4F4F" }}
        aria-label="Deschide meniu"
      >
        <Menu size={20} />
      </button>

      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-full w-64 flex flex-col transition-transform duration-300 lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
        style={{ backgroundColor: "#2F4F4F" }}
      >
        <div className="flex items-center justify-between p-4 lg:hidden border-b border-white/10">
          <span className="text-white font-bold">Evernest</span>
          <button onClick={() => setMobileOpen(false)} className="text-white/70 hover:text-white">
            <X size={20} />
          </button>
        </div>
        <SidebarContent onClose={() => setMobileOpen(false)} />
      </aside>
    </>
  )
}
