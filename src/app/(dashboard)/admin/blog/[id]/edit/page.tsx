import { supabaseAdmin } from "@/lib/supabase"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import BlogPostForm from "@/components/admin/BlogPostForm"

export default async function EditBlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const { data: post } = await supabaseAdmin
    .from("BlogPost")
    .select("*")
    .eq("id", id)
    .maybeSingle()

  if (!post) notFound()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/blog"
          className="p-2 rounded-lg border text-gray-500 hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Editează articolul</h1>
          <p className="text-gray-500 mt-0.5 line-clamp-1">{post.title}</p>
        </div>
      </div>
      <BlogPostForm post={post} />
    </div>
  )
}
