import { supabaseAdmin } from "@/lib/supabase"
import Link from "next/link"
import { Plus, Pencil, Eye, EyeOff } from "lucide-react"
import BlogDeleteButton from "@/components/admin/BlogDeleteButton"

export default async function AdminBlogPage() {
  const { data: posts } = await supabaseAdmin
    .from("BlogPost")
    .select("id, title, slug, published, publishedAt, createdAt")
    .order("createdAt", { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blog</h1>
          <p className="text-gray-500 mt-1">{posts?.length ?? 0} articol(e)</p>
        </div>
        <Link
          href="/admin/blog/new"
          className="flex items-center gap-2 px-4 py-2.5 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          style={{ backgroundColor: "#6B8E23" }}
        >
          <Plus size={16} />
          Articol nou
        </Link>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="text-left px-6 py-3 font-medium text-gray-500">Titlu</th>
              <th className="text-left px-6 py-3 font-medium text-gray-500">Status</th>
              <th className="text-left px-6 py-3 font-medium text-gray-500">Data</th>
              <th className="text-right px-6 py-3 font-medium text-gray-500">Acțiuni</th>
            </tr>
          </thead>
          <tbody>
            {(posts ?? []).length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                  Niciun articol. Creează primul tău articol!
                </td>
              </tr>
            ) : (
              (posts ?? []).map((post) => (
                <tr key={post.id} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900 line-clamp-1">{post.title}</p>
                    <p className="text-xs text-gray-400 font-mono mt-0.5">/blog/{post.slug}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        post.published
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {post.published ? <Eye size={11} /> : <EyeOff size={11} />}
                      {post.published ? "Publicat" : "Schiță"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {new Date(post.createdAt).toLocaleDateString("ro-RO", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/blog/${post.slug}`}
                        target="_blank"
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                        title="Vizualizează"
                      >
                        <Eye size={15} />
                      </Link>
                      <Link
                        href={`/admin/blog/${post.id}/edit`}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                        title="Editează"
                      >
                        <Pencil size={15} />
                      </Link>
                      <BlogDeleteButton id={post.id} title={post.title} />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
