"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Trash2, Loader2 } from "lucide-react"

export default function BlogDeleteButton({ id, title }: { id: string; title: string }) {
  const router = useRouter()
  const [confirm, setConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    setDeleting(true)
    try {
      await fetch(`/api/blog/${id}`, { method: "DELETE" })
      router.refresh()
    } finally {
      setDeleting(false)
      setConfirm(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setConfirm(true)}
        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
        title="Șterge"
      >
        <Trash2 size={15} />
      </button>

      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm">
            <h3 className="font-semibold text-gray-900 mb-2">Șterge articolul</h3>
            <p className="text-sm text-gray-500 mb-4">
              Ești sigur că vrei să ștergi{" "}
              <span className="font-medium text-gray-900">&ldquo;{title}&rdquo;</span>? Acțiunea este ireversibilă.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirm(false)}
                className="flex-1 px-4 py-2 border rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Anulează
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleting && <Loader2 size={14} className="animate-spin" />}
                Șterge
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
