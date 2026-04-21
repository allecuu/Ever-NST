import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, MapPin, Phone, FileText, Package } from "lucide-react"
import OrderStatusSelect from "@/components/admin/OrderStatusSelect"
import type { OrderStatus } from "@/types"

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  SHIPPED: "bg-purple-100 text-purple-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true, image: true } },
      items: {
        include: {
          product: { select: { id: true, name: true, slug: true, images: true } },
        },
      },
    },
  })

  if (!order) notFound()

  const subtotal = order.items.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/orders"
          className="p-2 rounded-lg border text-gray-500 hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">
              Comandă #{order.id.slice(-8).toUpperCase()}
            </h1>
            <span
              className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[order.status]}`}
            >
              {order.status}
            </span>
          </div>
          <p className="text-gray-500 mt-0.5">
            {new Date(order.createdAt).toLocaleDateString("ro-RO", {
              day: "2-digit",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Schimbă status:</span>
          <OrderStatusSelect orderId={order.id} status={order.status as OrderStatus} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border">
            <div className="p-6 border-b flex items-center gap-2">
              <Package size={18} className="text-gray-400" />
              <h2 className="font-semibold text-gray-900">Produse comandate</h2>
            </div>
            <div className="divide-y">
              {order.items.map((item) => (
                <div key={item.id} className="p-6 flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    {item.product.images[0] ? (
                      <Image
                        src={item.product.images[0]}
                        alt={item.product.name}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">{item.product.name}</p>
                    <p className="text-sm text-gray-400">Cantitate: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {(Number(item.price) * item.quantity).toLocaleString("ro-RO")} RON
                    </p>
                    <p className="text-xs text-gray-400">
                      {Number(item.price).toLocaleString("ro-RO")} RON / buc.
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-6 border-t bg-gray-50 rounded-b-xl">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">{subtotal.toLocaleString("ro-RO")} RON</span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-gray-600">Transport</span>
                <span className="font-medium text-green-600">
                  {subtotal >= 500 ? "Gratuit" : "50 RON"}
                </span>
              </div>
              <div className="flex justify-between items-center mt-3 pt-3 border-t">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="text-xl font-bold" style={{ color: "#6B8E23" }}>
                  {Number(order.total).toLocaleString("ro-RO")} RON
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl border p-6 space-y-4">
            <h2 className="font-semibold text-gray-900">Client</h2>
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0"
                style={{ backgroundColor: "#6B8E23" }}
              >
                {(order.user.name ?? order.user.email ?? "?")[0].toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-gray-900">{order.user.name ?? "—"}</p>
                <p className="text-sm text-gray-400">{order.user.email}</p>
              </div>
            </div>
          </div>

          {(order.address || order.phone || order.notes) && (
            <div className="bg-white rounded-xl border p-6 space-y-4">
              <h2 className="font-semibold text-gray-900">Detalii livrare</h2>
              {order.address && (
                <div className="flex items-start gap-3">
                  <MapPin size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-700">{order.address}</p>
                </div>
              )}
              {order.phone && (
                <div className="flex items-center gap-3">
                  <Phone size={16} className="text-gray-400 flex-shrink-0" />
                  <p className="text-sm text-gray-700">{order.phone}</p>
                </div>
              )}
              {order.notes && (
                <div className="flex items-start gap-3">
                  <FileText size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-700">{order.notes}</p>
                </div>
              )}
            </div>
          )}

          <div className="bg-white rounded-xl border p-6 space-y-2">
            <h2 className="font-semibold text-gray-900 mb-3">Detalii comandă</h2>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">ID complet</span>
              <span className="font-mono text-xs text-gray-400">{order.id}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Creat la</span>
              <span className="text-gray-700">
                {new Date(order.createdAt).toLocaleDateString("ro-RO")}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Actualizat</span>
              <span className="text-gray-700">
                {new Date(order.updatedAt).toLocaleDateString("ro-RO")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
