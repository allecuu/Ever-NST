import { auth } from "@/lib/auth"
import { supabaseAdmin } from "@/lib/supabase"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ShoppingBag, ArrowRight } from "lucide-react"

const STATUS_LABELS: Record<string, string> = {
  PENDING: "În așteptare",
  CONFIRMED: "Confirmat",
  SHIPPED: "Expediat",
  DELIVERED: "Livrat",
  CANCELLED: "Anulat",
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  SHIPPED: "bg-purple-100 text-purple-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
}

export default async function AccountPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const { data: orders } = await supabaseAdmin
    .from("Order")
    .select("id, total, status, createdAt, items:OrderItem(id)")
    .eq("userId", session.user.id)
    .order("createdAt", { ascending: false })

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Contul meu</h1>
        <p className="text-gray-500 mt-1">
          {session.user.name ?? session.user.email}
        </p>
      </div>

      <div className="bg-white rounded-xl border">
        <div className="p-6 border-b flex items-center gap-2">
          <ShoppingBag size={18} className="text-gray-400" />
          <h2 className="font-semibold text-gray-900">Comenzile mele</h2>
        </div>
        {(orders ?? []).length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-400 mb-4">Nu ai nicio comandă plasată</p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-sm font-medium hover:underline"
              style={{ color: "#6B8E23" }}
            >
              Explorează produsele <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="divide-y">
            {(orders ?? []).map((order) => (
              <div key={order.id} className="p-6 flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-gray-900 font-mono text-sm">
                    #{order.id.slice(-8).toUpperCase()}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(order.createdAt).toLocaleDateString("ro-RO", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}{" "}
                    · {order.items?.length ?? 0} produs(e)
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-gray-900">
                    {Number(order.total).toLocaleString("ro-RO")} RON
                  </span>
                  <span
                    className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[order.status]}`}
                  >
                    {STATUS_LABELS[order.status]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
