import { Router } from "express";
import { getJson } from "../lib/kv.js";

const router = Router();

interface BlogSummary {
  id: string; title: string; slug: string; excerpt: string;
  featuredImage: string; tags: string[]; readTime: string; createdAt: string;
}

interface BlogPost extends BlogSummary {
  content: string; metaTitle: string; metaDescription: string;
  published: boolean; adsEnabled: boolean; adTop: boolean;
  adMiddle: boolean; adBottom: boolean; adScript: string; updatedAt: string;
}

router.get("/blog", (_req, res) => {
  try {
    const posts = getJson<BlogSummary[]>("blog:index", []);
    res.json(posts);
  } catch {
    res.status(500).json({ error: "Failed to fetch posts" });
  }
});

router.get("/blog/:slug", (req, res) => {
  try {
    const { slug } = req.params;
    const post = getJson<BlogPost | null>(`blog:${slug}`, null);
    if (!post || !post.published) {
      res.status(404).json({ error: "Post not found" });
      return;
    }
    res.json(post);
  } catch {
    res.status(500).json({ error: "Failed to fetch post" });
  }
});

export default router;
