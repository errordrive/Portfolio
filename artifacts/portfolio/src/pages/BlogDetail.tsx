import { useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, Clock, Tag } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { api } from "../lib/api";
import type { BlogPost } from "../lib/api";

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
    const scriptEl = document.createElement("script");
    scriptEl.async = true;
    scriptEl.innerHTML = script.replace(/<script[^>]*>|<\/script>/gi, "").trim();
    container.appendChild(scriptEl);
    return () => {
      if (container.contains(scriptEl)) container.removeChild(scriptEl);
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
        </motion.div>
      </div>
    </div>
  );
}
