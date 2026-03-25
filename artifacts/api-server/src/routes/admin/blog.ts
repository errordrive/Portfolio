import { Router, type Request, type Response } from "express";
import { db, blogPosts } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "../../middlewares/auth.js";
import { z } from "zod";

const router = Router();

router.use(requireAuth);

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

router.get("/", async (_req: Request, res: Response) => {
  try {
    const posts = await db
      .select()
      .from(blogPosts)
      .orderBy(desc(blogPosts.createdAt));
    res.json(posts);
  } catch {
    res.status(500).json({ error: "Failed to fetch posts" });
  }
});

router.post("/", async (req: Request, res: Response) => {
  try {
    const parsed = BlogSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
      return;
    }
    const [post] = await db.insert(blogPosts).values(parsed.data).returning();
    res.status(201).json(post);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "";
    if (msg.includes("duplicate") || msg.includes("unique")) {
      res.status(409).json({ error: "Slug already exists" });
    } else {
      res.status(500).json({ error: "Failed to create post" });
    }
  }
});

router.put("/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

    const parsed = BlogSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
      return;
    }
    const [updated] = await db
      .update(blogPosts)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(blogPosts.id, id))
      .returning();

    if (!updated) { res.status(404).json({ error: "Post not found" }); return; }
    res.json(updated);
  } catch {
    res.status(500).json({ error: "Failed to update post" });
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

    await db.delete(blogPosts).where(eq(blogPosts.id, id));
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to delete post" });
  }
});

export default router;
