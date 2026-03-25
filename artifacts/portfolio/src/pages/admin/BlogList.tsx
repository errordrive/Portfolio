import { useEffect, useState } from "react";
import { Link } from "wouter";
import { api, type BlogPost } from "@/lib/api";
import { Plus, Pencil, Trash2, ExternalLink } from "lucide-react";

export default function BlogList() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    api.admin.blog.list().then(setPosts).catch(console.error).finally(() => setLoading(false));
  }, []);

  async function handleDelete(post: BlogPost) {
    if (!confirm(`Delete "${post.title}"?`)) return;
    setDeletingId(post.id);
    try {
      await api.admin.blog.delete(post.id);
      setPosts(ps => ps.filter(p => p.id !== post.id));
    } catch (e) {
      alert("Failed to delete post");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="max-w-5xl space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">{posts.length} post{posts.length !== 1 ? "s" : ""}</p>
        <Link href="/admin/blog/new">
          <a className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors">
            <Plus className="w-4 h-4" />
            New Post
          </a>
        </Link>
      </div>

      <div className="glass rounded-2xl border border-white/10 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground text-sm">Loading…</div>
        ) : posts.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-muted-foreground text-sm mb-3">No blog posts yet</div>
            <Link href="/admin/blog/new">
              <a className="text-primary text-sm font-medium">Create your first post →</a>
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Title</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden sm:table-cell">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">Date</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {posts.map(post => (
                <tr key={post.id} className="hover:bg-white/3 transition-colors">
                  <td className="px-5 py-3">
                    <div className="font-medium text-foreground truncate max-w-xs">{post.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5 truncate">{post.slug}</div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${post.published ? "bg-green-500/15 text-green-400" : "bg-muted text-muted-foreground"}`}>
                      {post.published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <Link href={`/admin/blog/${post.id}/edit`}>
                        <a className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors">
                          <Pencil className="w-3.5 h-3.5" />
                        </a>
                      </Link>
                      <button
                        onClick={() => handleDelete(post)}
                        disabled={deletingId === post.id}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
