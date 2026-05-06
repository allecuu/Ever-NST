import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import type { Metadata } from "next"
import { supabaseAdmin } from "@/lib/supabase"
import { Calendar, ArrowLeft, ArrowRight } from "lucide-react"

async function getPost(slug: string) {
  try {
    const { data: posts } = await supabaseAdmin
      .from("BlogPost")
      .select("*")
      .or(`id.eq.${slug},slug.eq.${slug}`)
      .eq("published", true)
      .limit(1)
    return posts?.[0] ?? null
  } catch { return null }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) return { title: "Articol negăsit" }
  return {
    title: `${post.title} | Blog Evernest`,
    description: post.excerpt ?? post.title,
    openGraph: {
      title: post.title,
      description: post.excerpt ?? undefined,
      images: post.coverImage ? [{ url: post.coverImage }] : [],
    },
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) notFound()

  const { data: related } = await supabaseAdmin
    .from("BlogPost")
    .select("id, title, slug, excerpt, coverImage, createdAt, publishedAt")
    .eq("published", true)
    .neq("id", post.id)
    .order("createdAt", { ascending: false })
    .limit(2)

  const date = new Date(post.publishedAt ?? post.createdAt).toLocaleDateString("ro-RO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })

  const paragraphs = post.content
    .split(/\n{2,}/)
    .map((p: string) => p.trim())
    .filter(Boolean)

  return (
    <div className="bg-[#f9f6f1] min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link href="/" className="hover:text-[#6B8E23]">Acasă</Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-[#6B8E23]">Blog</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium line-clamp-1">{post.title}</span>
        </nav>

        <article>
          {/* Cover image */}
          {post.coverImage && (
            <div className="relative aspect-[21/9] rounded-2xl overflow-hidden mb-10 shadow-md">
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          {/* Meta */}
          <div className="flex items-center gap-3 text-sm text-gray-400 mb-5">
            <Calendar size={14} />
            <span>{date}</span>
          </div>

          {/* Title */}
          <h1
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight"
            style={{ fontFamily: "var(--font-poppins)" }}
          >
            {post.title}
          </h1>

          {/* Excerpt highlight */}
          {post.excerpt && (
            <p className="text-lg text-gray-500 leading-relaxed mb-8 border-l-4 pl-5 italic"
              style={{ borderColor: "#6B8E23" }}>
              {post.excerpt}
            </p>
          )}

          {/* Content */}
          <div className="prose-custom space-y-5">
            {paragraphs.map((p: string, i: number) => {
              const isHeading = p.startsWith("# ")
              const isSubheading = p.startsWith("## ")
              if (isHeading) {
                return (
                  <h2 key={i} className="text-2xl font-bold text-gray-900 mt-10 mb-4"
                    style={{ fontFamily: "var(--font-poppins)" }}>
                    {p.slice(2)}
                  </h2>
                )
              }
              if (isSubheading) {
                return (
                  <h3 key={i} className="text-xl font-semibold text-gray-800 mt-8 mb-3"
                    style={{ fontFamily: "var(--font-poppins)" }}>
                    {p.slice(3)}
                  </h3>
                )
              }
              return (
                <p key={i} className="text-gray-700 leading-relaxed text-base whitespace-pre-line">
                  {p}
                </p>
              )
            })}
          </div>
        </article>

        {/* Back to blog */}
        <div className="mt-14 pt-8 border-t border-gray-200">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#6B8E23] hover:gap-3 transition-all"
          >
            <ArrowLeft size={15} /> Înapoi la Blog
          </Link>
        </div>

        {/* Related posts */}
        {(related ?? []).length > 0 && (
          <section className="mt-14">
            <h2 className="text-xl font-bold text-gray-900 mb-6" style={{ fontFamily: "var(--font-poppins)" }}>
              Alte articole
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {(related ?? []).map((rel) => (
                <Link
                  key={rel.id}
                  href={`/blog/${rel.slug}`}
                  className="group bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col"
                >
                  {rel.coverImage && (
                    <div className="relative aspect-video overflow-hidden bg-gray-100">
                      <Image src={rel.coverImage} alt={rel.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  )}
                  <div className="p-5 flex-1">
                    <p className="text-xs text-gray-400 mb-2">
                      {new Date(rel.publishedAt ?? rel.createdAt).toLocaleDateString("ro-RO", { day: "2-digit", month: "short", year: "numeric" })}
                    </p>
                    <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-[#6B8E23] transition-colors">
                      {rel.title}
                    </h3>
                    <span className="inline-flex items-center gap-1 text-xs text-[#6B8E23] font-medium mt-3">
                      Citește <ArrowRight size={12} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
