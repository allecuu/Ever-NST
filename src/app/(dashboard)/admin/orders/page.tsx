import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Eye } from "lucide-react"
import OrderStatusSelect from "@/components/admin/OrderStatusSelect"
import type { OrderStatus } from "@/types"

interface SearchParams {
  status?: string
  page?: string
}

const LIMIT = 20

const STATUS_LABELS: Record<string, string> = {
  PENDING: "În așteptare",
  CONFIRMED: "Confirmat",
  SHIPPED: "Expediat",
  DELIVERED: "Livrat",
  CANCELLED: "Anulat",
}

const STATUS_FILTERS = [
  { value: "all", label: "Toate" },
  { value: "PENDING", label: "În așteptare" },
  { value: "CONFIRMED", label: "Confirmate" },
  { value: "SHIPPED", label: "Expediate" },
  { value: "DELIVERED", label: "Livrate" },
  { value: "CANCELLED", label: "Anulate" },
]

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const sp = await searchParams
  const statusFilter = sp.status ?? "all"
  const page = Math.max(1, Number(sp.page ?? "1"))

  const where = statusFilter !== "all" ? { status: statusFilter as OrderStatus } : {}

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * LIMIT,
      take: LIMIT,
      include: {
        user: { select: { name: true, email: true } },
        items: { select: { id: true } },
      },
    }),
    prisma.order.count({ where }),
  ])

  const totalPages = Math.ceil(total / LIMIT)

  const buildUrl = (params: Record<string, string>) => {
    const q = new URLSearchParams({
      ...(statusFilter !== "all" && { status: statusFilter }),
      page: "1",
      ...params,
    })
    return `/admin/orders?${q}`
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Comenzi</h1>
        <p className="text-gray-500 mt-1">{total} comandă(e)</p>
      </div>

      <div className="bg-white rounded-xl border">
        <div className="p-4 border-b flex flex-wrap gap-2">
          {STATUS_FILTERS.map(({ value, label }) => (
            <Link
              key={value}
              href={buildUrl({ status: value })}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === value
                  ? "text-white"
                  : "border text-gray-600 hover:bg-gray-50"
              }`}
              style={statusFilter === value ? { backgroundColor: "#6B8E23" } : {}}
            >
              {label}
            </Link>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left px-6 py-3 font-medium text-gray-500">ID</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Client</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Data</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Produse</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Total</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Status</th>
                <th className="text-right px-6 py-3 font-medium text-gray-500">Detalii</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                    Nicio comandă
                    {statusFilter !== "all" && ` cu status "${STATUS_LABELS[statusFilter]}"`}
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-gray-500">
                      #{order.id.slice(-8).toUpperCase()}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{order.user.name ?? "—"}</p>
                      <p className="text-xs text-gray-400">{order.user.email}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString("ro-RO", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4 text-gray-500">{order.items.length} buc.</td>
                    <td className="px-6 py-4 font-semibold">
                      {Number(order.total).toLocaleString("ro-RO")} RON
                    </td>
                    <td className="px-6 py-4">
                      <OrderStatusSelect orderId={order.id} status={order.status as OrderStatus} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors inline-flex"
                        title="Vezi detalii"
                      >
                        <Eye size={15} />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="p-4 border-t flex items-center justify-between text-sm">
            <p className="text-gray-500">
              Pagina {page} din {totalPages}
            </p>
            <div className="flex gap-2">
              {page > 1 && (
                <Link
                  href={buildUrl({ page: String(page - 1) })}
                  className="px-3 py-1.5 border rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Anterior
                </Link>
              )}
              {page < totalPages && (
                <Link
                  href={buildUrl({ page: String(page + 1) })}
                  className="px-3 py-1.5 border rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Următor
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
