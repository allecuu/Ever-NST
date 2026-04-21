"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Pencil, Trash2, Eye, EyeOff, Loader2 } from "lucide-react"

interface ProductActionsProps {
  id: string
  isActive: boolean
}

export default function ProductActions({ id, isActive }: ProductActionsProps) {
  const router = useRouter()
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState<"delete" | "toggle" | null>(null)

  const toggle = async () => {
    setLoading("toggle")
    try {
      await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      })
      router.refresh()
    } finally {
      setLoading(null)
    }
  }

  const destroy = async () => {
    setLoading("delete")
    try {
      await fetch(`/api/products/${id}`, { method: "DELETE" })
      setShowConfirm(false)
      router.refresh()
    } finally {
      setLoading(null)
    }
  }

  return (
    <>
      <div className="flex items-center gap-1">
        <Link
          href={`/admin/products/${id}/edit`}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          title="Editează"
        >
          <Pencil size={15} />
        </Link>
        <button
          onClick={toggle}
          disabled={loading !== null}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50"
          title={isActive ? "Dezactivează" : "Activează"}
        >
          {loading === "toggle" ? (
            <Loader2 size={15} className="animate-spin" />
          ) : isActive ? (
            <EyeOff size={15} />
          ) : (
            <Eye size={15} />
          )}
        </button>
        <button
          onClick={() => setShowConfirm(true)}
          disabled={loading !== null}
          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
          title="Șterge"
        >
          <Trash2 size={15} />
        </button>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm mx-4">
            <h3 className="font-semibold text-gray-900 mb-2">Confirmare ștergere</h3>
            <p className="text-sm text-gray-500 mb-6">
              Produsul va fi dezactivat și nu va mai fi vizibil în magazin. Această acțiune poate
              fi revocată.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-4 py-2 border rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Anulează
              </button>
              <button
                onClick={destroy}
                disabled={loading === "delete"}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading === "delete" && <Loader2 size={14} className="animate-spin" />}
                Șterge
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
