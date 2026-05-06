import Link from "next/link"
import Image from "next/image"
import type { Metadata } from "next"
import { supabaseAdmin } from "@/lib/supabase"
import { Calendar, ArrowRight } from "lucide-react"

export const metadata: Metadata = {
  title: "Blog | Evernest",
  description: "Articole despre design interior, mobilă și decorațiuni pentru casa ta.",
}

export default async function BlogPage() {
  const { data: posts } = await supabaseAdmin
    .from("BlogPost")
    .select("id, title, slug, excerpt, coverImage, publishedAt, createdAt")
    .eq("published", true)
    .order("createdAt", { ascending: false })

  return (
    <div className="bg-[#f9f6f1] min-h-screen">
      {/* Hero */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 text-center">
          <p className="text-[#6B8E23] text-sm font-semibold uppercase tracking-widest mb-3">
            Inspirație & Idei
          </p>
          <h1
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
            style={{ fontFamily: "var(--font-poppins)" }}
          >
            Blogul Evernest
          </h1>
          <p className="text-gray-500 max-w-xl mx-auto">
            Sfaturi de design, tendințe în mobilă și idei pentru a transforma fiecare colț al casei tale.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        {(posts ?? []).length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">Niciun articol publicat momentan.</p>
            <p className="text-gray-400 text-sm mt-2">Revino curând!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {(posts ?? []).map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function BlogCard({ post }: {
  post: {
    id: string
    title: string
    slug: string
    excerpt: string | null
    coverImage: string | null
    publishedAt: string | null
    createdAt: string
  }
}) {
  const date = new Date(post.publishedAt ?? post.createdAt).toLocaleDateString("ro-RO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })

  return (
    <article className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col">
      <Link href={`/blog/${post.slug}`} className="block">
        <div className="aspect-[16/9] bg-gray-100 overflow-hidden relative">
          {post.coverImage ? (
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div
              className="w-full h-full"
              style={{ background: "linear-gradient(135deg, #2F4F4F, #6B8E23)" }}
            />
          )}
        </div>
      </Link>

      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
          <Calendar size={12} />
          {date}
        </div>

        <Link href={`/blog/${post.slug}`}>
          <h2 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-[#6B8E23] transition-colors line-clamp-2 leading-snug"
            style={{ fontFamily: "var(--font-poppins)" }}>
            {post.title}
          </h2>
        </Link>

        {post.excerpt && (
          <p className="text-sm text-gray-500 leading-relaxed line-clamp-3 flex-1">{post.excerpt}</p>
        )}

        <Link
          href={`/blog/${post.slug}`}
          className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[#6B8E23] hover:gap-2.5 transition-all"
        >
          Citește articolul <ArrowRight size={14} />
        </Link>
      </div>
    </article>
  )
}
