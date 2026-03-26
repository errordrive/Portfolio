import { Router, type Request, type Response } from "express";
import { db, blogPosts, blogComments, commentReactions } from "@workspace/db";
import { eq, and, desc, inArray } from "drizzle-orm";

const router = Router();

router.get("/blog/:slug/comments", async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const posts = await db
      .select({ id: blogPosts.id })
      .from(blogPosts)
      .where(eq(blogPosts.slug, slug))
      .limit(1);

    if (!posts.length) {
      res.status(404).json({ error: "Post not found" });
      return;
    }

    const postId = posts[0].id;

    const comments = await db
      .select()
      .from(blogComments)
      .where(and(eq(blogComments.postId, postId), eq(blogComments.approved, true)))
      .orderBy(desc(blogComments.createdAt));

    const commentIds = comments.map((c) => c.id);
    const reactions = commentIds.length
      ? await db
          .select()
          .from(commentReactions)
          .where(inArray(commentReactions.commentId, commentIds))
      : [];

    const reactionsMap: Record<number, { useful: number; not_useful: number }> = {};
    for (const r of reactions) {
      if (!reactionsMap[r.commentId]) {
        reactionsMap[r.commentId] = { useful: 0, not_useful: 0 };
      }
      if (r.type === "useful") reactionsMap[r.commentId].useful = r.count;
      if (r.type === "not_useful") reactionsMap[r.commentId].not_useful = r.count;
    }

    const topLevel = comments
      .filter((c) => !c.parentId)
      .map((c) => ({
        ...c,
        email: undefined,
        reactions: reactionsMap[c.id] ?? { useful: 0, not_useful: 0 },
        replies: comments
          .filter((r) => r.parentId === c.id)
          .map((r) => ({
            ...r,
            email: undefined,
            reactions: reactionsMap[r.id] ?? { useful: 0, not_useful: 0 },
          })),
      }));

    res.json(topLevel);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch comments" });
  }
});

router.post("/blog/:slug/comments", async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const { name, email, content, parentId } = req.body;

    if (!name?.trim() || !email?.trim() || !content?.trim()) {
      res.status(400).json({ error: "Name, email, and content are required" });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ error: "Invalid email address" });
      return;
    }

    const posts = await db
      .select({ id: blogPosts.id })
      .from(blogPosts)
      .where(and(eq(blogPosts.slug, slug), eq(blogPosts.published, true)))
      .limit(1);

    if (!posts.length) {
      res.status(404).json({ error: "Post not found" });
      return;
    }

    const postId = posts[0].id;

    let resolvedParentId: number | null = null;
    if (parentId !== undefined && parentId !== null && parentId !== "") {
      const pid = parseInt(String(parentId), 10);
      if (isNaN(pid) || pid <= 0) {
        res.status(400).json({ error: "Invalid parentId" });
        return;
      }
      const parentRows = await db
        .select({ id: blogComments.id, postId: blogComments.postId, parentId: blogComments.parentId })
        .from(blogComments)
        .where(eq(blogComments.id, pid))
        .limit(1);
      if (!parentRows.length) {
        res.status(404).json({ error: "Parent comment not found" });
        return;
      }
      const parent = parentRows[0];
      if (parent.postId !== postId) {
        res.status(400).json({ error: "Parent comment does not belong to this post" });
        return;
      }
      if (parent.parentId !== null) {
        res.status(400).json({ error: "Replies to replies are not allowed (max depth: 1)" });
        return;
      }
      resolvedParentId = pid;
    }

    const [comment] = await db
      .insert(blogComments)
      .values({
        postId,
        parentId: resolvedParentId,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        content: content.trim(),
        approved: false,
      })
      .returning({ id: blogComments.id });

    res.status(201).json({
      success: true,
      id: comment.id,
      message: "Your comment is awaiting moderation.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to submit comment" });
  }
});

router.post("/comments/:id/react", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { type } = req.body;

    if (isNaN(id) || !["useful", "not_useful"].includes(type)) {
      res.status(400).json({ error: "Invalid request" });
      return;
    }

    const existing = await db
      .select()
      .from(commentReactions)
      .where(and(eq(commentReactions.commentId, id), eq(commentReactions.type, type)))
      .limit(1);

    if (existing.length) {
      const [updated] = await db
        .update(commentReactions)
        .set({ count: existing[0].count + 1 })
        .where(eq(commentReactions.id, existing[0].id))
        .returning();
      res.json({ count: updated.count });
    } else {
      const [created] = await db
        .insert(commentReactions)
        .values({ commentId: id, type, count: 1 })
        .returning();
      res.json({ count: created.count });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update reaction" });
  }
});

export default router;
