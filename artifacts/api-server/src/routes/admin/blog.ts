import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { kv, getJson, putJson } from "../../lib/kv.js";
import { requireAuth } from "../../lib/auth.js";

const router = Router();
router.use(requireAuth);

interface BlogPost {
  id: string; title: string; slug: string; content: string; excerpt: string;
  featuredImage: string; tags: string[]; metaTitle: string; metaDescription: string;
  published: boolean; adsEnabled: boolean; adTop: boolean; adMiddle: boolean;
  adBottom: boolean; adScript: string; createdAt: string; updatedAt: string; readTime: string;
}
interface BlogSummary {
  id: string; title: string; slug: string; excerpt: string;
  featuredImage: string; tags: string[]; readTime: string; createdAt: string;
}

function calcReadTime(content: string): string {
  const words = content.trim().split(/\s+/).length;
  return `${Math.max(1, Math.ceil(words / 200))} min read`;
}

const BlogSchema = z.object({
  title: z.string().min(1).max(300),
  slug: z.string().min(1).max(300),
  content: z.string().optional().default(""),
  excerpt: z.string().optional().default(""),
  featuredImage: z.string().optional().default(""),
  tags: z.array(z.string()).optional().default([]),
  metaTitle: z.string().optional().default(""),
  metaDescription: z.string().optional().default(""),
  published: z.boolean().optional().default(false),
  adsEnabled: z.boolean().optional().default(false),
  adTop: z.boolean().optional().default(false),
  adMiddle: z.boolean().optional().default(false),
  adBottom: z.boolean().optional().default(false),
  adScript: z.string().optional().default(""),
});

router.get("/", (_req: Request, res: Response) => {
  try {
    const slugs = kv.list("blog:").filter(k => k !== "blog:index" && k !== "blog:counter");
    const posts: BlogPost[] = slugs
      .map(k => getJson<BlogPost | null>(k, null))
      .filter((p): p is BlogPost => p !== null)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json(posts);
  } catch {
    res.status(500).json({ error: "Failed to fetch posts" });
  }
});

router.post("/", (req: Request, res: Response) => {
  try {
    const parsed = BlogSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
      return;
    }
    const d = parsed.data;
    const existing = getJson<BlogPost | null>(`blog:${d.slug}`, null);
    if (existing) { res.status(409).json({ error: "Slug already exists" }); return; }

    const counter = parseInt(kv.get("blog:counter") || "0", 10) + 1;
    const id = String(counter);
    const now = new Date().toISOString();
    const post: BlogPost = {
      id, ...d, createdAt: now, updatedAt: now,
      readTime: calcReadTime(d.content),
    };
    putJson(`blog:${d.slug}`, post);
    kv.put("blog:counter", String(counter));

    if (d.published) {
      const index = getJson<BlogSummary[]>("blog:index", []);
      const summary: BlogSummary = {
        id, title: d.title, slug: d.slug, excerpt: d.excerpt,
        featuredImage: d.featuredImage, tags: d.tags,
        readTime: post.readTime, createdAt: now,
      };
      index.unshift(summary);
      putJson("blog:index", index);
    }
    res.status(201).json(post);
  } catch {
    res.status(500).json({ error: "Failed to create post" });
  }
});

router.put("/:id", (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const slugs = kv.list("blog:").filter(k => k !== "blog:index" && k !== "blog:counter");
    const key = slugs.find(k => {
      const p = getJson<BlogPost | null>(k, null);
      return p?.id === id;
    });
    if (!key) { res.status(404).json({ error: "Post not found" }); return; }

    const existing = getJson<BlogPost>(key, null as unknown as BlogPost);
    const parsed = BlogSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
      return;
    }
    const d = parsed.data;
    const updated: BlogPost = {
      ...existing, ...d,
      updatedAt: new Date().toISOString(),
      readTime: d.content !== undefined ? calcReadTime(d.content) : existing.readTime,
    };

    if (d.slug && d.slug !== existing.slug) {
      kv.delete(key);
      putJson(`blog:${d.slug}`, updated);
    } else {
      putJson(key, updated);
    }

    const index = getJson<BlogSummary[]>("blog:index", []);
    const filtered = index.filter(s => s.id !== id);
    if (updated.published) {
      const summary: BlogSummary = {
        id: updated.id, title: updated.title, slug: updated.slug, excerpt: updated.excerpt,
        featuredImage: updated.featuredImage, tags: updated.tags,
        readTime: updated.readTime, createdAt: updated.createdAt,
      };
      filtered.unshift(summary);
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    putJson("blog:index", filtered);
    res.json(updated);
  } catch {
    res.status(500).json({ error: "Failed to update post" });
  }
});

router.delete("/:id", (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const slugs = kv.list("blog:").filter(k => k !== "blog:index" && k !== "blog:counter");
    const key = slugs.find(k => {
      const p = getJson<BlogPost | null>(k, null);
      return p?.id === id;
    });
    if (!key) { res.status(404).json({ error: "Post not found" }); return; }

    const post = getJson<BlogPost>(key, null as unknown as BlogPost);
    kv.delete(key);
    const index = getJson<BlogSummary[]>("blog:index", []);
    putJson("blog:index", index.filter(s => s.id !== id));

    const ids = getJson<string[]>(`comments:${post.slug}`, []);
    for (const cid of ids) kv.delete(`comment:${cid}`);
    kv.delete(`comments:${post.slug}`);

    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to delete post" });
  }
});

export default router;
