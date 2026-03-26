import { Router, type Request, type Response } from "express";
import { kv, getJson, putJson } from "../../lib/kv.js";
import { requireAuth } from "../../lib/auth.js";

const router = Router();
router.use(requireAuth);

interface Comment {
  id: string; slug: string; parentId: string | null;
  name: string; email: string; content: string;
  approved: boolean; createdAt: string;
}

router.get("/", (_req: Request, res: Response) => {
  try {
    const keys = kv.list("comment:");
    const comments: Comment[] = keys
      .map(k => getJson<Comment | null>(k, null))
      .filter((c): c is Comment => c !== null)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json(comments);
  } catch {
    res.status(500).json({ error: "Failed to fetch comments" });
  }
});

router.patch("/:id", (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const comment = getJson<Comment | null>(`comment:${id}`, null);
    if (!comment) { res.status(404).json({ error: "Comment not found" }); return; }
    const updated = { ...comment, approved: !comment.approved };
    putJson(`comment:${id}`, updated);
    res.json(updated);
  } catch {
    res.status(500).json({ error: "Failed to update comment" });
  }
});

router.delete("/:id", (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const comment = getJson<Comment | null>(`comment:${id}`, null);
    if (!comment) { res.status(404).json({ error: "Comment not found" }); return; }
    kv.delete(`comment:${id}`);
    const ids = getJson<string[]>(`comments:${comment.slug}`, []);
    putJson(`comments:${comment.slug}`, ids.filter(i => i !== id));
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to delete comment" });
  }
});

export default router;
