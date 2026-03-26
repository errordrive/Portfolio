import { Router, type Request, type Response } from "express";
import { db, blogComments, blogPosts } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "../../middlewares/auth.js";

const router = Router();

router.use(requireAuth);

router.get("/", async (_req: Request, res: Response) => {
  try {
    const comments = await db
      .select({
        id: blogComments.id,
        postId: blogComments.postId,
        parentId: blogComments.parentId,
        name: blogComments.name,
        email: blogComments.email,
        content: blogComments.content,
        approved: blogComments.approved,
        createdAt: blogComments.createdAt,
        postTitle: blogPosts.title,
        postSlug: blogPosts.slug,
      })
      .from(blogComments)
      .leftJoin(blogPosts, eq(blogComments.postId, blogPosts.id))
      .orderBy(desc(blogComments.createdAt));

    res.json(comments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch comments" });
  }
});

router.patch("/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

    const { approved } = req.body;
    if (typeof approved !== "boolean") {
      res.status(400).json({ error: "approved must be a boolean" });
      return;
    }

    const [updated] = await db
      .update(blogComments)
      .set({ approved })
      .where(eq(blogComments.id, id))
      .returning();

    if (!updated) { res.status(404).json({ error: "Comment not found" }); return; }

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update comment" });
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

    await db.delete(blogComments).where(eq(blogComments.id, id));
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete comment" });
  }
});

export default router;
