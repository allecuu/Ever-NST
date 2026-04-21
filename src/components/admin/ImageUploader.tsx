"use client"

import { useState, useRef, DragEvent, ChangeEvent } from "react"
import Image from "next/image"
import { Upload, X, GripVertical, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface ImageUploaderProps {
  value: string[]
  onChange: (urls: string[]) => void
  maxImages?: number
}

export default function ImageUploader({ value, onChange, maxImages = 10 }: ImageUploaderProps) {
  const [isDraggingOver, setIsDraggingOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [dragIdx, setDragIdx] = useState<number | null>(null)
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const uploadFile = async (file: File): Promise<string | null> => {
    const formData = new FormData()
    formData.append("file", file)
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData })
      if (!res.ok) return null
      const data = await res.json()
      return data.url as string
    } catch {
      return null
    }
  }

  const handleFiles = async (files: File[]) => {
    const remaining = maxImages - value.length
    if (remaining <= 0) return
    const toUpload = files.slice(0, remaining).filter((f) => f.type.startsWith("image/"))
    if (!toUpload.length) return
    setUploading(true)
    const urls = await Promise.all(toUpload.map(uploadFile))
    const valid = urls.filter((u): u is string => u !== null)
    onChange([...value, ...valid])
    setUploading(false)
  }

  const handleDrop = (e: DragEvent) => {
    e.preventDefault()
    setIsDraggingOver(false)
    handleFiles(Array.from(e.dataTransfer.files))
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) handleFiles(Array.from(e.target.files))
    e.target.value = ""
  }

  const handleReorderDragStart = (idx: number) => setDragIdx(idx)

  const handleReorderDragOver = (e: DragEvent, idx: number) => {
    e.preventDefault()
    setDragOverIdx(idx)
  }

  const handleReorderDrop = (e: DragEvent, idx: number) => {
    e.preventDefault()
    if (dragIdx === null || dragIdx === idx) {
      setDragIdx(null)
      setDragOverIdx(null)
      return
    }
    const reordered = [...value]
    const [moved] = reordered.splice(dragIdx, 1)
    reordered.splice(idx, 0, moved)
    onChange(reordered)
    setDragIdx(null)
    setDragOverIdx(null)
  }

  const remove = (idx: number) => onChange(value.filter((_, i) => i !== idx))

  const canAdd = value.length < maxImages

  return (
    <div className="space-y-3">
      {canAdd && (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault()
            setIsDraggingOver(true)
          }}
          onDragLeave={() => setIsDraggingOver(false)}
          onClick={() => !uploading && inputRef.current?.click()}
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
            uploading ? "cursor-not-allowed opacity-60" : "cursor-pointer",
            isDraggingOver
              ? "bg-[#f0f4e8]"
              : "border-gray-300 hover:border-[#6B8E23] hover:bg-gray-50",
          )}
          style={isDraggingOver ? { borderColor: "#6B8E23" } : {}}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2 text-gray-500">
              <Loader2 size={24} className="animate-spin" />
              <span className="text-sm">Se încarcă imaginile...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-gray-400">
              <Upload size={24} />
              <span className="text-sm font-medium text-gray-600">
                Trage imaginile sau click pentru selectare
              </span>
              <span className="text-xs">
                JPG, PNG, WebP · max 5MB per imagine · {value.length}/{maxImages}
              </span>
            </div>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={handleInputChange}
          />
        </div>
      )}

      {value.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
          {value.map((url, idx) => (
            <div
              key={url}
              draggable
              onDragStart={() => handleReorderDragStart(idx)}
              onDragOver={(e) => handleReorderDragOver(e, idx)}
              onDrop={(e) => handleReorderDrop(e, idx)}
              onDragEnd={() => {
                setDragIdx(null)
                setDragOverIdx(null)
              }}
              className={cn(
                "relative group aspect-square rounded-lg overflow-hidden border bg-gray-100 cursor-grab active:cursor-grabbing transition-opacity",
                dragIdx === idx && "opacity-40",
                dragOverIdx === idx && dragIdx !== idx && "ring-2 ring-[#6B8E23]",
              )}
            >
              <Image src={url} alt={`Imagine ${idx + 1}`} fill className="object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    remove(idx)
                  }}
                  className="p-1.5 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors"
                >
                  <X size={13} />
                </button>
              </div>
              <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <GripVertical size={14} className="text-white drop-shadow" />
              </div>
              {idx === 0 && (
                <div className="absolute bottom-1 left-1 text-xs text-white px-1.5 py-0.5 rounded font-medium"
                  style={{ backgroundColor: "#6B8E23" }}>
                  Principal
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
