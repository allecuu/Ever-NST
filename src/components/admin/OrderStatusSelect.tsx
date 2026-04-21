"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import type { OrderStatus } from "@/types"

const STATUSES: OrderStatus[] = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"]

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "În așteptare",
  CONFIRMED: "Confirmat",
  SHIPPED: "Expediat",
  DELIVERED: "Livrat",
  CANCELLED: "Anulat",
}

const STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
  CONFIRMED: "bg-blue-100 text-blue-800 border-blue-200",
  SHIPPED: "bg-purple-100 text-purple-800 border-purple-200",
  DELIVERED: "bg-green-100 text-green-800 border-green-200",
  CANCELLED: "bg-red-100 text-red-800 border-red-200",
}

interface OrderStatusSelectProps {
  orderId: string
  status: OrderStatus
}

export default function OrderStatusSelect({ orderId, status }: OrderStatusSelectProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [current, setCurrent] = useState(status)

  const handleChange = async (next: OrderStatus) => {
    if (next === current) return
    setLoading(true)
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      })
      if (res.ok) {
        setCurrent(next)
        router.refresh()
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative inline-flex items-center gap-1.5">
      {loading && <Loader2 size={13} className="animate-spin text-gray-400 flex-shrink-0" />}
      <select
        value={current}
        onChange={(e) => handleChange(e.target.value as OrderStatus)}
        disabled={loading}
        className={`text-xs font-medium px-2.5 py-1 rounded-full border appearance-none cursor-pointer focus:outline-none disabled:opacity-50 ${STATUS_COLORS[current]}`}
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {STATUS_LABELS[s]}
          </option>
        ))}
      </select>
    </div>
  )
}
