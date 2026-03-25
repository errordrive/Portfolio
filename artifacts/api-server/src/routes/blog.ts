import { Router } from "express";
import { db, blogPosts } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router = Router();

router.get("/blog", async (_req, res) => {
  try {
    const posts = await db
      .select({
        id: blogPosts.id,
        title: blogPosts.title,
        slug: blogPosts.slug,
        excerpt: blogPosts.excerpt,
        featuredImage: blogPosts.featuredImage,
        tags: blogPosts.tags,
        createdAt: blogPosts.createdAt,
      })
      .from(blogPosts)
      .where(eq(blogPosts.published, true))
      .orderBy(desc(blogPosts.createdAt));

    res.json(posts);
  } catch {
    res.status(500).json({ error: "Failed to fetch posts" });
  }
});

router.get("/blog/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const rows = await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.slug, slug))
      .limit(1);

    if (!rows.length || !rows[0].published) {
      res.status(404).json({ error: "Post not found" });
      return;
    }
    res.json(rows[0]);
  } catch {
    res.status(500).json({ error: "Failed to fetch post" });
  }
});

export default router;
