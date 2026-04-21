import Link from "next/link"
import { Mail, Phone, MapPin } from "lucide-react"

const shopLinks = [
  { label: "Toate produsele", href: "/products" },
  { label: "Categorii", href: "/categories" },
  { label: "Oferte", href: "/products?sort=newest" },
  { label: "Produse noi", href: "/products?sort=newest" },
]

const infoLinks = [
  { label: "Despre Evernest", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Politica de returnare", href: "/returns" },
  { label: "Termeni și condiții", href: "/terms" },
]

export default function Footer() {
  return (
    <footer style={{ backgroundColor: "#2F4F4F" }} className="text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

          {/* Col 1: Logo + tagline */}
          <div className="space-y-4">
            <Link href="/">
              <span className="text-2xl font-bold" style={{ fontFamily: "var(--font-poppins)" }}>
                Ever<span style={{ color: "#9DC840" }}>nest</span>
              </span>
            </Link>
            <p className="text-sm text-gray-300 leading-relaxed max-w-xs">
              Mobilă și decorațiuni atent selecționate pentru a transforma casa ta într-un cămin cu adevărat al tău.
            </p>
            <div className="flex gap-3 pt-2">
              {["Facebook", "Instagram", "Pinterest"].map((s) => (
                <span key={s}
                  className="text-xs px-3 py-1.5 rounded-full border border-white/20 text-gray-300 hover:border-white/50 hover:text-white cursor-pointer transition-colors">
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Col 2: Links */}
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h4 className="text-sm font-semibold mb-4 text-white uppercase tracking-wide">Magazin</h4>
              <ul className="space-y-2.5">
                {shopLinks.map(({ label, href }) => (
                  <li key={label}>
                    <Link href={href} className="text-sm text-gray-300 hover:text-white transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-4 text-white uppercase tracking-wide">Info</h4>
              <ul className="space-y-2.5">
                {infoLinks.map(({ label, href }) => (
                  <li key={label}>
                    <Link href={href} className="text-sm text-gray-300 hover:text-white transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Col 3: Contact */}
          <div>
            <h4 className="text-sm font-semibold mb-4 text-white uppercase tracking-wide">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-gray-300">
                <MapPin size={15} className="shrink-0 mt-0.5 text-[#9DC840]" />
                <span>Str. Exemplu 12, București, România</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-300">
                <Phone size={15} className="shrink-0 text-[#9DC840]" />
                <a href="tel:+40700000000" className="hover:text-white transition-colors">+40 700 000 000</a>
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-300">
                <Mail size={15} className="shrink-0 text-[#9DC840]" />
                <a href="mailto:contact@evernest.ro" className="hover:text-white transition-colors">contact@evernest.ro</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-gray-400">
          <p>© {new Date().getFullYear()} Evernest. Toate drepturile rezervate.</p>
          <p>Creat cu grijă pentru casa ta 🌿</p>
        </div>
      </div>
    </footer>
  )
}
