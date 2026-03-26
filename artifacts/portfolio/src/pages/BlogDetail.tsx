import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, Clock, Tag, MessageSquare, ThumbsUp, ThumbsDown, Reply, Send, CheckCircle } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { api } from "../lib/api";
import type { BlogPost, Comment } from "../lib/api";

function readingTime(html: string): number {
  const text = html.replace(/<[^>]*>/g, "");
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function splitAtMidParagraph(html: string): [string, string] {
  const parts = html.split("</p>");
  if (parts.length <= 2) return [html, ""];
  const mid = Math.ceil(parts.length / 2);
  const first = parts.slice(0, mid).join("</p>") + "</p>";
  const second = parts.slice(mid).join("</p>");
  return [first, second];
}

function AdUnit({ className = "" }: { className?: string }) {
  return (
    <div className={`w-full py-4 ${className}`}>
      <div className="glass border border-border/40 rounded-xl px-4 py-3 text-center">
        <div className="text-xs text-muted-foreground/60 uppercase tracking-widest mb-1">Advertisement</div>
        <ins
          className="adsbygoogle"
          style={{ display: "block" }}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    </div>
  );
}

function AdScriptInjector({ script }: { script: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!script || !ref.current) return;
    const container = ref.current;
    const injected: HTMLScriptElement[] = [];

    const parser = new DOMParser();
    const doc = parser.parseFromString(script, "text/html");
    const templates = doc.querySelectorAll("script");

    if (templates.length > 0) {
      templates.forEach((tpl) => {
        const el = document.createElement("script");
        Array.from(tpl.attributes).forEach((attr) => {
          el.setAttribute(attr.name, attr.value);
        });
        if (tpl.textContent) el.textContent = tpl.textContent;
        container.appendChild(el);
        injected.push(el);
      });
    } else {
      const el = document.createElement("script");
      const inline = script.replace(/<script[^>]*>|<\/script>/gi, "").trim();
      if (inline) {
        el.textContent = inline;
        container.appendChild(el);
        injected.push(el);
      }
    }

    return () => {
      injected.forEach((el) => {
        if (container.contains(el)) container.removeChild(el);
      });
    };
  }, [script]);

  return <div ref={ref} />;
}

function SkeletonDetail() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-24 pb-20 animate-pulse">
      <div className="h-4 w-32 bg-white/5 rounded mb-10" />
      <div className="aspect-video bg-white/5 rounded-2xl mb-8" />
      <div className="h-8 w-3/4 bg-white/5 rounded mb-4" />
      <div className="h-4 w-40 bg-white/5 rounded mb-8" />
      <div className="space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className={`h-4 bg-white/5 rounded ${i % 3 === 2 ? "w-2/3" : "w-full"}`} />
        ))}
      </div>
    </div>
  );
}

export default function BlogDetail() {
  const { slug } = useParams<{ slug: string }>();

  const { data: post, isLoading, isError } = useQuery<BlogPost>({
    queryKey: ["blog-post", slug],
    queryFn: () => api.blog.getBySlug(slug!),
    enabled: !!slug,
    staleTime: 60_000,
    retry: 1,
  });

  if (isLoading) return <div className="min-h-screen bg-background text-foreground"><SkeletonDetail /></div>;

  if (isError || !post) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📄</div>
          <h1 className="text-2xl font-black mb-2">Post Not Found</h1>
          <p className="text-muted-foreground mb-6">This post doesn't exist or has been removed.</p>
          <Link to="/blog" className="inline-flex items-center gap-2 text-primary hover:underline">
            <ArrowLeft className="w-4 h-4" /> Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  const minutes = readingTime(post.content);
  const metaTitle = post.metaTitle || post.title;
  const metaDesc = post.metaDescription || post.excerpt;
  const showAds = post.adsEnabled;
  const [firstHalf, secondHalf] = showAds && post.adMiddle
    ? splitAtMidParagraph(post.content)
    : [post.content, ""];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <title>{metaTitle}</title>
        {metaDesc && <meta name="description" content={metaDesc} />}
        <meta property="og:title" content={metaTitle} />
        {metaDesc && <meta property="og:description" content={metaDesc} />}
        {post.featuredImage && <meta property="og:image" content={post.featuredImage} />}
        <meta property="og:type" content="article" />
      </Helmet>

      {showAds && post.adScript && <AdScriptInjector script={post.adScript} />}

      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5 pointer-events-none" />

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 pt-24 pb-20">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-10"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Blog
          </Link>

          {post.featuredImage && (
            <div className="aspect-video rounded-2xl overflow-hidden mb-8 border border-border/30">
              <img
                src={post.featuredImage}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {showAds && post.adTop && <AdUnit className="mb-6" />}

          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDate(post.createdAt)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {minutes} min read
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground leading-tight mb-6">
            {post.title}
          </h1>

          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20"
                >
                  <Tag className="w-2.5 h-2.5" />
                  {tag}
                </span>
              ))}
            </div>
          )}

          <article
            className="prose prose-invert prose-sm sm:prose-base max-w-none
              prose-headings:font-black prose-headings:text-foreground
              prose-p:text-muted-foreground prose-p:leading-relaxed
              prose-a:text-primary prose-a:no-underline hover:prose-a:underline
              prose-strong:text-foreground
              prose-code:text-primary prose-code:bg-primary/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none
              prose-pre:bg-[#0d0d0d] prose-pre:border prose-pre:border-border/50 prose-pre:rounded-xl
              prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground
              prose-img:rounded-xl prose-img:border prose-img:border-border/30
              prose-hr:border-border/30"
          >
            {showAds && post.adMiddle && secondHalf ? (
              <>
                <div dangerouslySetInnerHTML={{ __html: firstHalf }} />
                <AdUnit className="my-8 not-prose" />
                <div dangerouslySetInnerHTML={{ __html: secondHalf }} />
              </>
            ) : (
              <div dangerouslySetInnerHTML={{ __html: post.content }} />
            )}
          </article>

          {showAds && post.adBottom && <AdUnit className="mt-10" />}

          <div className="mt-12 pt-8 border-t border-border/30">
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 font-semibold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Blog
            </Link>
          </div>

          <CommentSection slug={slug!} />
        </motion.div>
      </div>
    </div>
  );
}

// ─────────────────────────── Comment Section ──────────────────────────────────

function formatRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

interface CommentFormProps {
  slug: string;
  parentId?: number;
  onSuccess: () => void;
  onCancel?: () => void;
  compact?: boolean;
}

function CommentForm({ slug, parentId, onSuccess, onCancel, compact }: CommentFormProps) {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const mutation = useMutation({
    mutationFn: () => api.comments.submit(slug, { name, email, content, parentId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog-comments", slug] });
      setSubmitted(true);
      setName(""); setEmail(""); setContent("");
      setTimeout(() => { setSubmitted(false); onSuccess(); }, 3000);
    },
  });

  if (submitted) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-400 glass rounded-xl px-4 py-3 border border-green-500/20">
        <CheckCircle className="w-4 h-4 shrink-0" />
        Your comment is awaiting moderation. Thank you!
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); if (name && email && content) mutation.mutate(); }}
      className={`space-y-3 ${compact ? "" : "glass border border-border/40 rounded-2xl p-5"}`}
    >
      {!compact && <h3 className="text-sm font-bold text-foreground">Leave a Comment</h3>}
      <div className={`grid gap-3 ${compact ? "grid-cols-1" : "sm:grid-cols-2"}`}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name *"
          required
          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-border/40 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email address *"
          required
          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-border/40 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
        />
      </div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write your comment..."
        required
        rows={compact ? 2 : 4}
        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-border/40 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors resize-none"
      />
      {mutation.isError && (
        <p className="text-xs text-red-400">{(mutation.error as Error).message}</p>
      )}
      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={mutation.isPending || !name || !email || !content}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-xs font-semibold disabled:opacity-50 hover:bg-primary/90 transition-colors"
        >
          <Send className="w-3 h-3" />
          {mutation.isPending ? "Submitting…" : "Submit"}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

interface CommentCardProps {
  comment: Comment;
  slug: string;
  isReply?: boolean;
}

function CommentCard({ comment, slug, isReply }: CommentCardProps) {
  const queryClient = useQueryClient();
  const [replying, setReplying] = useState(false);
  const [reactions, setReactions] = useState(comment.reactions);

  const reactMutation = useMutation({
    mutationFn: (type: "useful" | "not_useful") => api.comments.react(comment.id, type),
    onSuccess: (data, type) => {
      setReactions((prev) => ({
        ...prev,
        [type]: data.count,
      }));
    },
  });

  return (
    <div className={`${isReply ? "ml-6 pl-4 border-l border-border/30" : ""}`}>
      <div className="glass border border-border/30 rounded-xl p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0">
              {comment.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="text-sm font-semibold text-foreground">{comment.name}</div>
              <div className="text-[10px] text-muted-foreground">{formatRelative(comment.createdAt)}</div>
            </div>
          </div>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed mb-3">{comment.content}</p>
        <div className="flex items-center gap-3">
          <button
            onClick={() => reactMutation.mutate("useful")}
            disabled={reactMutation.isPending}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-green-400 transition-colors"
          >
            <ThumbsUp className="w-3.5 h-3.5" />
            <span>{reactions.useful}</span>
          </button>
          <button
            onClick={() => reactMutation.mutate("not_useful")}
            disabled={reactMutation.isPending}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-red-400 transition-colors"
          >
            <ThumbsDown className="w-3.5 h-3.5" />
            <span>{reactions.not_useful}</span>
          </button>
          {!isReply && (
            <button
              onClick={() => setReplying(!replying)}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors ml-auto"
            >
              <Reply className="w-3.5 h-3.5" />
              Reply
            </button>
          )}
        </div>
      </div>

      {replying && (
        <div className="mt-2 ml-6">
          <CommentForm
            slug={slug}
            parentId={comment.id}
            compact
            onSuccess={() => setReplying(false)}
            onCancel={() => setReplying(false)}
          />
        </div>
      )}

      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-2 space-y-2">
          {comment.replies.map((reply) => (
            <CommentCard key={reply.id} comment={reply} slug={slug} isReply />
          ))}
        </div>
      )}
    </div>
  );
}

function CommentSection({ slug }: { slug: string }) {
  const { data: comments = [], isLoading } = useQuery<Comment[]>({
    queryKey: ["blog-comments", slug],
    queryFn: () => api.comments.list(slug),
    staleTime: 30_000,
  });

  const totalCount = comments.reduce((acc, c) => acc + 1 + (c.replies?.length ?? 0), 0);

  return (
    <div className="mt-16 pt-10 border-t border-border/30">
      <div className="flex items-center gap-2 mb-8">
        <MessageSquare className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-black text-foreground">
          {totalCount > 0 ? `${totalCount} Comment${totalCount !== 1 ? "s" : ""}` : "Comments"}
        </h2>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="glass border border-border/30 rounded-xl p-6 text-center mb-8">
          <MessageSquare className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No comments yet. Be the first to share your thoughts!</p>
        </div>
      ) : (
        <div className="space-y-4 mb-10">
          {comments.map((comment) => (
            <CommentCard key={comment.id} comment={comment} slug={slug} />
          ))}
        </div>
      )}

      <CommentForm slug={slug} onSuccess={() => {}} />
    </div>
  );
}
