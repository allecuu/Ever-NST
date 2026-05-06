import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import BlogPostForm from "@/components/admin/BlogPostForm"

export default function NewBlogPostPage() {
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
          <h1 className="text-2xl font-bold text-gray-900">Articol nou</h1>
          <p className="text-gray-500 mt-0.5">Creează un articol pentru blog</p>
        </div>
      </div>
      <BlogPostForm />
    </div>
  )
}
