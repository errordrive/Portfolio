import { useQuery } from "@tanstack/react-query";
import { api, type BlogPost } from "@/lib/api";
import { Link } from "react-router-dom";
import { CalendarDays, Tag, ArrowRight } from "lucide-react";

function PostCard({ post }: { post: BlogPost }) {
  const date = new Date(post.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <Link
      to={`/blog/${post.slug}`}
      className="group glass rounded-2xl border border-white/10 overflow-hidden flex flex-col hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300"
    >
      {post.featuredImage ? (
        <div className="relative h-44 overflow-hidden bg-muted">
          <img
            src={post.featuredImage}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
      ) : (
        <div className="h-44 bg-gradient-to-br from-primary/20 via-purple-500/10 to-transparent flex items-center justify-center">
          <span className="text-5xl opacity-30">✍️</span>
        </div>
      )}

      <div className="flex flex-col flex-1 p-5 gap-3">
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {post.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-semibold border border-primary/20"
              >
                <Tag className="w-2.5 h-2.5" />
                {tag}
              </span>
            ))}
          </div>
        )}

        <h3 className="text-base font-bold text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2">
          {post.title}
        </h3>

        {post.excerpt && (
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed flex-1">
            {post.excerpt}
          </p>
        )}

        <div className="flex items-center justify-between pt-1 border-t border-white/5 mt-auto">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarDays className="w-3.5 h-3.5" />
            {date}
          </span>
          <span className="flex items-center gap-1 text-xs font-semibold text-primary group-hover:gap-2 transition-all">
            Read more <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}

function SkeletonCard() {
  return (
    <div className="glass rounded-2xl border border-white/10 overflow-hidden animate-pulse">
      <div className="h-44 bg-muted" />
      <div className="p-5 space-y-3">
        <div className="flex gap-2">
          <div className="h-5 w-16 rounded-full bg-muted" />
          <div className="h-5 w-12 rounded-full bg-muted" />
        </div>
        <div className="h-5 w-full rounded bg-muted" />
        <div className="h-5 w-3/4 rounded bg-muted" />
        <div className="h-4 w-full rounded bg-muted" />
        <div className="h-4 w-2/3 rounded bg-muted" />
      </div>
    </div>
  );
}

export default function BlogSection() {
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["blog-public"],
    queryFn: () => api.blog.list(),
    staleTime: 2 * 60_000,
  });

  const recent = posts.slice(0, 3);

  if (!isLoading && recent.length === 0) return null;

  return (
    <section id="blog" className="py-20 px-4 relative">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
          <div>
            <p className="text-primary text-sm font-semibold tracking-widest uppercase mb-2">
              Writing
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground">
              Latest from the Blog
            </h2>
            <p className="text-muted-foreground mt-2 text-sm max-w-md">
              Thoughts on AI, vibe coding, Android RE, and building things fast.
            </p>
          </div>
          <Link
            to="/blog"
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-primary/30 text-primary text-sm font-semibold hover:bg-primary/10 transition-colors shrink-0"
          >
            All posts <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
            : recent.map((post) => <PostCard key={post.id} post={post} />)}
        </div>
      </div>
    </section>
  );
}
