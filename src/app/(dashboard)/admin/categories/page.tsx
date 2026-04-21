"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { Plus, Pencil, Trash2, X, Loader2 } from "lucide-react"
import { slugify } from "@/lib/utils"

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  image: string | null
  _count: { products: number }
}

interface CategoryForm {
  name: string
  slug: string
  description: string
  image: string
}

const empty: CategoryForm = { name: "", slug: "", description: "", image: "" }

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<{ open: boolean; editing?: Category }>({ open: false })
  const [form, setForm] = useState<CategoryForm>(empty)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [confirm, setConfirm] = useState<Category | null>(null)
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchCategories = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/categories")
      const data = await res.json()
      setCategories(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCategories() }, [])

  useEffect(() => {
    if (!toast) return
    toastTimer.current = setTimeout(() => setToast(null), 3500)
    return () => { if (toastTimer.current) clearTimeout(toastTimer.current) }
  }, [toast])

  const openCreate = () => {
    setForm(empty)
    setModal({ open: true })
  }

  const openEdit = (cat: Category) => {
    setForm({
      name: cat.name,
      slug: cat.slug,
      description: cat.description ?? "",
      image: cat.image ?? "",
    })
    setModal({ open: true, editing: cat })
  }

  const closeModal = () => setModal({ open: false })

  const handleNameChange = (name: string) => {
    setForm((f) => ({
      ...f,
      name,
      slug: modal.editing ? f.slug : slugify(name),
    }))
  }

  const handleImageUpload = async (file: File) => {
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append("file", file)
      const res = await fetch("/api/upload", { method: "POST", body: fd })
      if (!res.ok) { setToast({ message: "Eroare la încărcarea imaginii", type: "error" }); return }
      const { url } = await res.json()
      setForm((f) => ({ ...f, image: url }))
    } finally {
      setUploading(false)
    }
  }

  const save = async () => {
    if (!form.name.trim()) return
    setSaving(true)
    try {
      const url = modal.editing ? `/api/categories/${modal.editing.id}` : "/api/categories"
      const res = await fetch(url, {
        method: modal.editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          slug: form.slug || slugify(form.name),
          description: form.description || undefined,
          image: form.image || undefined,
        }),
      })
      if (!res.ok) {
        setToast({ message: "A apărut o eroare la salvare", type: "error" })
        return
      }
      setToast({ message: modal.editing ? "Categorie actualizată!" : "Categorie creată!", type: "success" })
      closeModal()
      fetchCategories()
    } finally {
      setSaving(false)
    }
  }

  const destroy = async (cat: Category) => {
    setDeleting(cat.id)
    try {
      await fetch(`/api/categories/${cat.id}`, { method: "DELETE" })
      setToast({ message: "Categorie ștearsă!", type: "success" })
      setConfirm(null)
      fetchCategories()
    } finally {
      setDeleting(null)
    }
  }

  return (
    <>
      {toast && (
        <div
          className="fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium"
          style={{ backgroundColor: toast.type === "success" ? "#6B8E23" : "#ef4444" }}
        >
          {toast.message}
        </div>
      )}

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Categorii</h1>
            <p className="text-gray-500 mt-1">{categories.length} categorie(i)</p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
            style={{ backgroundColor: "#6B8E23" }}
          >
            <Plus size={16} />
            Adaugă categorie
          </button>
        </div>

        <div className="bg-white rounded-xl border overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={24} className="animate-spin text-gray-400" />
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Categorie</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Slug</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Produse</th>
                  <th className="text-right px-6 py-3 font-medium text-gray-500">Acțiuni</th>
                </tr>
              </thead>
              <tbody>
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                      Nicio categorie creată
                    </td>
                  </tr>
                ) : (
                  categories.map((cat) => (
                    <tr key={cat.id} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            {cat.image ? (
                              <Image
                                src={cat.image}
                                alt={cat.name}
                                width={40}
                                height={40}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-200" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{cat.name}</p>
                            {cat.description && (
                              <p className="text-xs text-gray-400 truncate max-w-48">{cat.description}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-gray-500">{cat.slug}</td>
                      <td className="px-6 py-4 text-gray-600">{cat._count.products} produs(e)</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEdit(cat)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                            title="Editează"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => setConfirm(cat)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Șterge"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="font-semibold text-gray-900">
                {modal.editing ? "Editează categorie" : "Categorie nouă"}
              </h2>
              <button
                onClick={closeModal}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nume <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B8E23]/30 focus:border-[#6B8E23] transition-colors"
                  placeholder="ex: Canapele"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                <input
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#6B8E23]/30 focus:border-[#6B8E23] transition-colors"
                  placeholder="ex: canapele"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descriere</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={3}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B8E23]/30 focus:border-[#6B8E23] transition-colors resize-none"
                  placeholder="Descriere scurtă..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Imagine</label>
                {form.image ? (
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden border group">
                    <Image src={form.image} alt="Preview" fill className="object-cover" />
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, image: "" }))}
                      className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-[#6B8E23] hover:bg-gray-50 transition-colors"
                  >
                    {uploading ? (
                      <div className="flex items-center justify-center gap-2 text-gray-500">
                        <Loader2 size={16} className="animate-spin" />
                        <span className="text-sm">Se încarcă...</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">Click pentru a adăuga imagine</span>
                    )}
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleImageUpload(file)
                    e.target.value = ""
                  }}
                />
              </div>
            </div>

            <div className="flex gap-3 p-6 pt-0">
              <button
                onClick={closeModal}
                className="flex-1 px-4 py-2.5 border rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Anulează
              </button>
              <button
                onClick={save}
                disabled={saving || !form.name.trim()}
                className="flex-1 px-4 py-2.5 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{ backgroundColor: "#6B8E23" }}
              >
                {saving && <Loader2 size={14} className="animate-spin" />}
                {modal.editing ? "Actualizează" : "Creează"}
              </button>
            </div>
          </div>
        </div>
      )}

      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm">
            <h3 className="font-semibold text-gray-900 mb-2">Șterge categoria</h3>
            <p className="text-sm text-gray-500 mb-1">
              Ești sigur că vrei să ștergi{" "}
              <span className="font-medium text-gray-900">{confirm.name}</span>?
            </p>
            {confirm._count.products > 0 && (
              <p className="text-xs text-red-500 mb-4">
                Atenție: această categorie are {confirm._count.products} produse asociate.
              </p>
            )}
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setConfirm(null)}
                className="flex-1 px-4 py-2 border rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Anulează
              </button>
              <button
                onClick={() => destroy(confirm)}
                disabled={deleting === confirm.id}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleting === confirm.id && <Loader2 size={14} className="animate-spin" />}
                Șterge
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
