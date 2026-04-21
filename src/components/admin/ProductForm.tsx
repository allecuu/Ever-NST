"use client"

import { useEffect, useState, useRef } from "react"
import { useForm, Controller, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { X, Plus } from "lucide-react"
import { productSchema, type ProductInput } from "@/lib/validations"
import { slugify } from "@/lib/utils"
import ImageUploader from "./ImageUploader"
import type { Category, Product } from "@/types"

interface ProductFormProps {
  product?: Product & { category: Category }
  categories: Category[]
}

export default function ProductForm({ product, categories }: ProductFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)
  const [featureInput, setFeatureInput] = useState("")
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProductInput>({
    resolver: zodResolver(productSchema) as Resolver<ProductInput>,
    defaultValues: product
      ? {
          name: product.name,
          description: product.description ?? "",
          price: Number(product.price),
          stock: product.stock,
          images: product.images,
          features: product.features,
          categoryId: product.categoryId,
          isActive: product.isActive,
        }
      : {
          name: "",
          description: "",
          price: 0,
          stock: 0,
          images: [],
          features: [],
          categoryId: "",
          isActive: true,
        },
  })

  const name = watch("name")
  const features = watch("features") ?? []

  useEffect(() => {
    if (!toast) return
    toastTimer.current = setTimeout(() => setToast(null), 4000)
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current)
    }
  }, [toast])

  const addFeature = () => {
    const trimmed = featureInput.trim()
    if (!trimmed || features.includes(trimmed)) return
    setValue("features", [...features, trimmed])
    setFeatureInput("")
  }

  const removeFeature = (idx: number) => {
    setValue("features", features.filter((_, i) => i !== idx))
  }

  const onSubmit = async (data: ProductInput) => {
    setLoading(true)
    try {
      const url = product ? `/api/products/${product.id}` : "/api/products"
      const res = await fetch(url, {
        method: product ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        setToast({
          message: typeof err.error === "string" ? err.error : "A apărut o eroare la salvare",
          type: "error",
        })
        return
      }
      setToast({ message: product ? "Produs actualizat!" : "Produs creat cu succes!", type: "success" })
      setTimeout(() => router.push("/admin/products"), 1200)
    } catch {
      setToast({ message: "A apărut o eroare de rețea", type: "error" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium transition-all`}
          style={{ backgroundColor: toast.type === "success" ? "#6B8E23" : "#ef4444" }}
        >
          {toast.message}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border p-6 space-y-4">
              <h2 className="font-semibold text-gray-900">Informații de bază</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nume <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("name")}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B8E23]/30 focus:border-[#6B8E23] transition-colors"
                  placeholder="ex: Canapea Manhattan"
                />
                {errors.name && (
                  <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>
                )}
                {name && (
                  <p className="text-xs text-gray-400 mt-1">
                    Slug: <span className="font-mono">{slugify(name)}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descriere</label>
                <textarea
                  {...register("description")}
                  rows={5}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B8E23]/30 focus:border-[#6B8E23] transition-colors resize-none"
                  placeholder="Descrierea detaliată a produsului..."
                />
              </div>
            </div>

            <div className="bg-white rounded-xl border p-6 space-y-4">
              <h2 className="font-semibold text-gray-900">Imagini produs</h2>
              <Controller
                name="images"
                control={control}
                render={({ field }) => (
                  <ImageUploader value={field.value} onChange={field.onChange} />
                )}
              />
              <p className="text-xs text-gray-400">
                Prima imagine va fi afișată ca imagine principală. Trage pentru a reordona.
              </p>
            </div>

            <div className="bg-white rounded-xl border p-6 space-y-4">
              <h2 className="font-semibold text-gray-900">Caracteristici</h2>
              <div className="flex gap-2">
                <input
                  value={featureInput}
                  onChange={(e) => setFeatureInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      addFeature()
                    }
                  }}
                  className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B8E23]/30 focus:border-[#6B8E23] transition-colors"
                  placeholder="ex: Lemn masiv de stejar — apasă Enter"
                />
                <button
                  type="button"
                  onClick={addFeature}
                  className="px-3 py-2 text-white rounded-lg text-sm hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: "#6B8E23" }}
                >
                  <Plus size={16} />
                </button>
              </div>
              {features.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {features.map((f, i) => (
                    <span
                      key={i}
                      className="flex items-center gap-1.5 text-sm px-3 py-1 rounded-full"
                      style={{ backgroundColor: "#f0f4e8", color: "#6B8E23" }}
                    >
                      {f}
                      <button
                        type="button"
                        onClick={() => removeFeature(i)}
                        className="hover:text-red-500 transition-colors leading-none"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl border p-6 space-y-4">
              <h2 className="font-semibold text-gray-900">Preț și stoc</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preț (RON) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  {...register("price", { valueAsNumber: true })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B8E23]/30 focus:border-[#6B8E23] transition-colors"
                />
                {errors.price && (
                  <p className="text-xs text-red-500 mt-1">{errors.price.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stoc <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  {...register("stock", { valueAsNumber: true })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B8E23]/30 focus:border-[#6B8E23] transition-colors"
                />
                {errors.stock && (
                  <p className="text-xs text-red-500 mt-1">{errors.stock.message}</p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl border p-6 space-y-4">
              <h2 className="font-semibold text-gray-900">Categorie</h2>
              <select
                {...register("categoryId")}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B8E23]/30 focus:border-[#6B8E23] transition-colors bg-white"
              >
                <option value="">Selectează categoria</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <p className="text-xs text-red-500 mt-1">{errors.categoryId.message}</p>
              )}
            </div>

            <div className="bg-white rounded-xl border p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Status</h2>
              <Controller
                name="isActive"
                control={control}
                render={({ field }) => (
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={field.value}
                      onClick={() => field.onChange(!field.value)}
                      className={`relative w-11 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#6B8E23]/30`}
                      style={{ backgroundColor: field.value ? "#6B8E23" : "#d1d5db" }}
                    >
                      <span
                        className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${field.value ? "translate-x-5" : "translate-x-0"}`}
                      />
                    </button>
                    <span className="text-sm font-medium text-gray-700">
                      {field.value ? "Activ — vizibil în magazin" : "Inactiv — ascuns din magazin"}
                    </span>
                  </label>
                )}
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => router.push("/admin/products")}
                className="flex-1 px-4 py-2.5 border rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Anulează
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2.5 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: "#6B8E23" }}
              >
                {loading ? "Se salvează..." : product ? "Actualizează" : "Creează produs"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </>
  )
}
