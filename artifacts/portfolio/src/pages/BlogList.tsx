import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Search, Calendar, Clock, Tag } from "lucide-react";
import { api } from "../lib/api";
import type { BlogPost } from "../lib/api";

function readingTime(html: string): number {
  const text = html.replace(/<[^>]*>/g, "");
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function PostCard({ post, i }: { post: BlogPost; i: number }) {
  const minutes = readingTime(post.content);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: i * 0.07 }}
      className="group"
    >
      <Link to={`/blog/${post.slug}`} className="block">
        <div className="glass rounded-2xl overflow-hidden border border-border/50 hover:border-primary/30 transition-all duration-300 group-hover:-translate-y-1">
          {post.featuredImage && (
            <div className="aspect-video overflow-hidden bg-muted/30">
              <img
                src={post.featuredImage}
                alt={post.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
            </div>
          )}
          <div className="p-6">
            <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatDate(post.createdAt)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {minutes} min read
              </span>
            </div>

            <h2 className="font-black text-xl text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
              {post.title}
            </h2>

            {post.excerpt && (
              <p className="text-muted-foreground text-sm leading-relaxed mb-4 line-clamp-3">
                {post.excerpt}
              </p>
            )}

            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {post.tags.slice(0, 4).map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20"
                  >
                    <Tag className="w-2.5 h-2.5" />
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function SkeletonCard() {
  return (
    <div className="glass rounded-2xl overflow-hidden border border-border/50 animate-pulse">
      <div className="aspect-video bg-white/5" />
      <div className="p-6 space-y-3">
        <div className="h-3 w-40 bg-white/5 rounded" />
        <div className="h-6 w-3/4 bg-white/5 rounded" />
        <div className="h-4 w-full bg-white/5 rounded" />
        <div className="h-4 w-2/3 bg-white/5 rounded" />
        <div className="flex gap-2 mt-2">
          <div className="h-5 w-14 bg-white/5 rounded-full" />
          <div className="h-5 w-18 bg-white/5 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export default function BlogList() {
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const { data: posts = [], isLoading, isError } = useQuery<BlogPost[]>({
    queryKey: ["blog-list"],
    queryFn: () => api.blog.list(),
    staleTime: 60_000,
    retry: 1,
  });

  const allTags = Array.from(new Set(posts.flatMap((p) => p.tags ?? []))).sort();

  const filtered = posts.filter((p) => {
    const matchesSearch =
      !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      (p.excerpt ?? "").toLowerCase().includes(search.toLowerCase());
    const matchesTag = !activeTag || (p.tags ?? []).includes(activeTag);
    return matchesSearch && matchesTag;
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5 pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-10"
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Portfolio
          </Link>

          <div className="flex items-end justify-between gap-6 flex-wrap">
            <div>
              <span className="text-primary text-sm font-semibold tracking-widest uppercase">Blog</span>
              <h1 className="mt-2 text-4xl lg:text-5xl font-black">
                Thoughts & <span className="gradient-text">Writes</span>
              </h1>
              <p className="mt-3 text-muted-foreground max-w-xl">
                Notes on AI tools, vibe coding, Android RE, and whatever else I'm figuring out.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-4 mb-8"
        >
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search posts…"
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-muted/30 border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
            />
          </div>

          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveTag(null)}
                className={`text-xs px-3 py-1.5 rounded-full font-medium border transition-colors ${
                  !activeTag
                    ? "bg-primary text-white border-primary"
                    : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                }`}
              >
                All
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                  className={`text-xs px-3 py-1.5 rounded-full font-medium border transition-colors ${
                    activeTag === tag
                      ? "bg-primary/20 text-primary border-primary/40"
                      : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {isError && !isLoading && (
          <div className="text-center py-20">
            <div className="text-4xl mb-4">📡</div>
            <div className="text-foreground font-semibold mb-2">Couldn't load posts</div>
            <div className="text-muted-foreground text-sm">The API might be unreachable right now. Try again later.</div>
          </div>
        )}

        {!isLoading && !isError && filtered.length === 0 && (
          <div className="text-center py-20">
            <div className="text-4xl mb-4">📝</div>
            <div className="text-foreground font-semibold mb-2">
              {posts.length === 0 ? "No posts yet" : "No posts match your search"}
            </div>
            <div className="text-muted-foreground text-sm">
              {posts.length === 0
                ? "Come back soon — content is being written."
                : "Try a different search term or tag filter."}
            </div>
          </div>
        )}

        {!isLoading && filtered.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((post, i) => (
              <PostCard key={post.id} post={post} i={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
