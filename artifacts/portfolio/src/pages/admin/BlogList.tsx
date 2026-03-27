import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { api, type BlogPost } from "@/lib/api";
import { Plus, Pencil, Trash2 } from "lucide-react";

export default function BlogList() {
  const queryClient = useQueryClient();

  const { data: posts = [], isLoading } = useQuery<BlogPost[]>({
    queryKey: ["admin-posts"],
    queryFn: () => api.admin.blog.list(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.admin.blog.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-posts"] }),
    onError: () => alert("Failed to delete post"),
  });

  function handleDelete(post: BlogPost) {
    if (!confirm(`Delete "${post.title}"?`)) return;
    deleteMutation.mutate(post.id);
  }

  return (
    <div className="max-w-5xl space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">{posts.length} post{posts.length !== 1 ? "s" : ""}</p>
        <Link
          to="/admin/blog/new"
          className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors shrink-0"
        >
          <Plus className="w-4 h-4 shrink-0" />
          <span className="hidden sm:inline">New Post</span>
        </Link>
      </div>

      <div className="glass rounded-2xl border border-white/10 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground text-sm">Loading…</div>
        ) : posts.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-muted-foreground text-sm mb-3">No blog posts yet</div>
            <Link to="/admin/blog/new" className="text-primary text-sm font-medium">Create your first post →</Link>
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
                  <td className="px-3 sm:px-5 py-3 min-w-0">
                    <div className="font-medium text-foreground truncate max-w-[180px] sm:max-w-xs">{post.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5 truncate max-w-[180px] sm:max-w-xs">{post.slug}</div>
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
                      <Link to={`/admin/blog/${post.id}/edit`} className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors">
                        <Pencil className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        onClick={() => handleDelete(post)}
                        disabled={deleteMutation.isPending && deleteMutation.variables === post.id}
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
