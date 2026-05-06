"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Loader2, Upload, X, Eye, EyeOff } from "lucide-react"
import { slugify } from "@/lib/utils"

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  coverImage: string | null
  published: boolean
}

interface Props {
  post?: BlogPost
}

export default function BlogPostForm({ post }: Props) {
  const router = useRouter()
  const [title, setTitle] = useState(post?.title ?? "")
  const [slug, setSlug] = useState(post?.slug ?? "")
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "")
  const [content, setContent] = useState(post?.content ?? "")
  const [coverImage, setCoverImage] = useState(post?.coverImage ?? "")
  const [published, setPublished] = useState(post?.published ?? false)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isEdit = !!post

  useEffect(() => {
    if (!toast) return
    toastTimer.current = setTimeout(() => setToast(null), 3500)
    return () => { if (toastTimer.current) clearTimeout(toastTimer.current) }
  }, [toast])

  function handleTitleChange(value: string) {
    setTitle(value)
    if (!isEdit) setSlug(slugify(value))
  }

  async function handleImageUpload(file: File) {
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append("file", file)
      const res = await fetch("/api/upload", { method: "POST", body: fd })
      if (!res.ok) { setToast({ message: "Eroare la încărcarea imaginii", type: "error" }); return }
      const { url } = await res.json()
      setCoverImage(url)
    } finally {
      setUploading(false)
    }
  }

  async function handleSave() {
    if (!title.trim() || !content.trim() || !slug.trim()) {
      setToast({ message: "Titlul, slug-ul și conținutul sunt obligatorii", type: "error" })
      return
    }
    setSaving(true)
    try {
      const url = isEdit ? `/api/blog/${post!.id}` : "/api/blog"
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug,
          excerpt: excerpt || undefined,
          content,
          coverImage: coverImage || undefined,
          published,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setToast({ message: data.error ?? "Eroare la salvare", type: "error" })
        return
      }
      setToast({ message: isEdit ? "Articol actualizat!" : "Articol creat!", type: "success" })
      setTimeout(() => router.push("/admin/blog"), 800)
    } finally {
      setSaving(false)
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

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="xl:col-span-2 space-y-5">
          <div className="bg-white rounded-xl border p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Titlu <span className="text-red-500">*</span>
              </label>
              <input
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Titlul articolului..."
                className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B8E23]/30 focus:border-[#6B8E23] transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400 shrink-0">/blog/</span>
                <input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="slug-articol"
                  className="flex-1 border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#6B8E23]/30 focus:border-[#6B8E23] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rezumat</label>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={2}
                placeholder="Un scurt rezumat al articolului (apare în previzualizări)..."
                className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B8E23]/30 focus:border-[#6B8E23] transition-colors resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Conținut <span className="text-red-500">*</span>
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={18}
                placeholder="Scrie conținutul articolului aici...&#10;&#10;Poți folosi rânduri goale pentru a separa paragrafele."
                className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B8E23]/30 focus:border-[#6B8E23] transition-colors resize-y leading-relaxed font-mono"
              />
              <p className="mt-1 text-xs text-gray-400">
                Rândul gol = paragraf nou · {content.length} caractere
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Publish */}
          <div className="bg-white rounded-xl border p-5 space-y-4">
            <h3 className="font-semibold text-gray-900">Publicare</h3>
            <button
              type="button"
              onClick={() => setPublished(!published)}
              className={`flex items-center gap-2 w-full px-4 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                published
                  ? "bg-green-50 border-green-300 text-green-700"
                  : "bg-gray-50 border-gray-200 text-gray-600"
              }`}
            >
              {published ? <Eye size={15} /> : <EyeOff size={15} />}
              {published ? "Publicat" : "Schiță (draft)"}
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
              style={{ backgroundColor: "#6B8E23" }}
            >
              {saving && <Loader2 size={14} className="animate-spin" />}
              {isEdit ? "Salvează modificările" : "Creează articolul"}
            </button>
          </div>

          {/* Cover image */}
          <div className="bg-white rounded-xl border p-5 space-y-3">
            <h3 className="font-semibold text-gray-900">Imagine principală</h3>
            {coverImage ? (
              <div className="relative rounded-lg overflow-hidden aspect-video bg-gray-100 group">
                <Image src={coverImage} alt="Cover" fill className="object-cover" />
                <button
                  type="button"
                  onClick={() => setCoverImage("")}
                  className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={13} />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center cursor-pointer hover:border-[#6B8E23] hover:bg-gray-50 transition-colors"
              >
                {uploading ? (
                  <div className="flex flex-col items-center gap-2 text-gray-400">
                    <Loader2 size={20} className="animate-spin" />
                    <span className="text-xs">Se încarcă...</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-gray-400">
                    <Upload size={20} />
                    <span className="text-xs">Click pentru a adăuga imaginea</span>
                  </div>
                )}
              </div>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleImageUpload(file)
                e.target.value = ""
              }}
            />
            {coverImage && (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                Schimbă imaginea
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
