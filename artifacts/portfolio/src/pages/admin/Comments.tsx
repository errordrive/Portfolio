import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle, Trash2, Clock, ExternalLink } from "lucide-react";
import { api } from "@/lib/api";
import type { AdminComment } from "@/lib/api";

type Filter = "all" | "pending" | "approved";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Comments() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<Filter>("all");

  const { data: comments = [], isLoading } = useQuery<AdminComment[]>({
    queryKey: ["admin-comments"],
    queryFn: () => api.admin.comments.list(),
    staleTime: 15_000,
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, approved }: { id: number; approved: boolean }) =>
      api.admin.comments.approve(id, approved),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-comments"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.admin.comments.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-comments"] }),
  });

  const filtered = comments.filter((c) => {
    if (filter === "pending") return !c.approved;
    if (filter === "approved") return c.approved;
    return true;
  });

  const counts = {
    all: comments.length,
    pending: comments.filter((c) => !c.approved).length,
    approved: comments.filter((c) => c.approved).length,
  };

  const tabs: { key: Filter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "pending", label: "Pending" },
    { key: "approved", label: "Approved" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-foreground">Comments Manager</h2>
        <p className="text-sm text-muted-foreground mt-1">Moderate and manage blog comments</p>
      </div>

      <div className="flex gap-2">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === key
                ? "bg-primary text-white"
                : "glass border border-border/40 text-muted-foreground hover:text-foreground"
            }`}
          >
            {label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
              filter === key ? "bg-white/20" : "bg-white/5"
            }`}>
              {counts[key]}
            </span>
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass border border-border/30 rounded-xl p-12 text-center">
          <Clock className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No comments found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((comment) => (
            <div
              key={comment.id}
              className={`glass border rounded-xl p-4 ${
                comment.approved ? "border-border/30" : "border-amber-500/20"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                  {comment.name.charAt(0).toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-1">
                    <span className="text-sm font-semibold text-foreground">{comment.name}</span>
                    <span className="text-xs text-muted-foreground">{comment.email}</span>
                    {comment.parentId && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-500/10 text-violet-400 border border-violet-500/20">
                        Reply
                      </span>
                    )}
                    <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
                      comment.approved
                        ? "bg-green-500/10 text-green-400 border-green-500/20"
                        : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                    }`}>
                      {comment.approved ? "Approved" : "Pending"}
                    </span>
                  </div>

                  {comment.postTitle && (
                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground mb-2">
                      <span>On:</span>
                      <a
                        href={`/blog/${comment.postSlug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center gap-0.5"
                      >
                        {comment.postTitle}
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  )}

                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                    {comment.content}
                  </p>

                  <div className="text-[10px] text-muted-foreground/60 mt-1">
                    {formatDate(comment.createdAt)}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {!comment.approved ? (
                    <button
                      onClick={() => approveMutation.mutate({ id: comment.id, approved: true })}
                      disabled={approveMutation.isPending}
                      title="Approve"
                      className="p-2 rounded-lg text-muted-foreground hover:text-green-400 hover:bg-green-500/10 transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => approveMutation.mutate({ id: comment.id, approved: false })}
                      disabled={approveMutation.isPending}
                      title="Unapprove"
                      className="p-2 rounded-lg text-green-400 hover:text-muted-foreground hover:bg-white/5 transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (confirm("Delete this comment?")) deleteMutation.mutate(comment.id);
                    }}
                    disabled={deleteMutation.isPending}
                    title="Delete"
                    className="p-2 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
