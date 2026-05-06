import { supabaseAdmin } from "@/lib/supabase"
import Link from "next/link"
import { Package, ShoppingBag, TrendingUp, Users, Plus, ArrowRight } from "lucide-react"

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  SHIPPED: "bg-purple-100 text-purple-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: "În așteptare",
  CONFIRMED: "Confirmat",
  SHIPPED: "Expediat",
  DELIVERED: "Livrat",
  CANCELLED: "Anulat",
}

export default async function AdminPage() {
  const [
    { count: productCount },
    { count: orderCount },
    { count: userCount },
    { data: revenueOrders },
    { data: recentOrders },
  ] = await Promise.all([
    supabaseAdmin.from("Product").select("*", { count: "exact", head: true }).eq("isActive", true),
    supabaseAdmin.from("Order").select("*", { count: "exact", head: true }),
    supabaseAdmin.from("User").select("*", { count: "exact", head: true }),
    supabaseAdmin
      .from("Order")
      .select("total")
      .in("status", ["CONFIRMED", "SHIPPED", "DELIVERED"]),
    supabaseAdmin
      .from("Order")
      .select("*, user:User(name, email), items:OrderItem(id)")
      .order("createdAt", { ascending: false })
      .limit(5),
  ])

  const revenue = (revenueOrders ?? []).reduce((sum, o) => sum + Number(o.total), 0)

  const stats = [
    { label: "Produse active", value: productCount ?? 0, icon: Package, bg: "bg-green-50", fg: "text-green-600" },
    { label: "Total comenzi", value: orderCount ?? 0, icon: ShoppingBag, bg: "bg-blue-50", fg: "text-blue-600" },
    { label: "Venituri", value: `${revenue.toLocaleString("ro-RO")} RON`, icon: TrendingUp, bg: "bg-purple-50", fg: "text-purple-600" },
    { label: "Utilizatori", value: userCount ?? 0, icon: Users, bg: "bg-orange-50", fg: "text-orange-600" },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Bun venit în panoul de administrare!</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map(({ label, value, icon: Icon, bg, fg }) => (
          <div key={label} className="bg-white rounded-xl border p-6 flex items-center gap-4">
            <div className={`p-3 rounded-lg ${bg} ${fg}`}>
              <Icon size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-sm text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white rounded-xl border">
          <div className="p-6 border-b flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Comenzi recente</h2>
            <Link
              href="/admin/orders"
              className="text-sm flex items-center gap-1 hover:underline"
              style={{ color: "#6B8E23" }}
            >
              Vezi toate <ArrowRight size={14} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left px-6 py-3 font-medium text-gray-500">ID</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Client</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Produse</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Total</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {(recentOrders ?? []).length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-gray-400">
                      Nicio comandă momentan
                    </td>
                  </tr>
                ) : (
                  (recentOrders ?? []).map((order) => (
                    <tr key={order.id} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-gray-500">
                        #{order.id.slice(-8).toUpperCase()}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">{order.user?.name ?? "—"}</p>
                        <p className="text-xs text-gray-400">{order.user?.email}</p>
                      </td>
                      <td className="px-6 py-4 text-gray-500">{order.items?.length ?? 0} buc.</td>
                      <td className="px-6 py-4 font-semibold">
                        {Number(order.total).toLocaleString("ro-RO")} RON
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[order.status]}`}
                        >
                          {STATUS_LABELS[order.status]}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl border p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Acțiuni rapide</h2>
          <div className="space-y-3">
            <Link
              href="/admin/products/new"
              className="flex items-center gap-3 p-4 rounded-lg border border-dashed hover:bg-[#f0f4e8] transition-colors"
              style={{ borderColor: "#6B8E23", color: "#6B8E23" }}
            >
              <Plus size={20} />
              <span className="font-medium">Adaugă produs nou</span>
            </Link>
            <Link
              href="/admin/orders"
              className="flex items-center gap-3 p-4 rounded-lg border border-dashed border-blue-400 text-blue-600 hover:bg-blue-50 transition-colors"
            >
              <ShoppingBag size={20} />
              <span className="font-medium">Gestionează comenzi</span>
            </Link>
            <Link
              href="/admin/categories"
              className="flex items-center gap-3 p-4 rounded-lg border border-dashed border-purple-400 text-purple-600 hover:bg-purple-50 transition-colors"
            >
              <Package size={20} />
              <span className="font-medium">Gestionează categorii</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
