import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { kv, getJson, putJson } from "../lib/kv.js";

const router = Router();

interface Comment {
  id: string; slug: string; parentId: string | null;
  name: string; email: string; content: string;
  approved: boolean; createdAt: string;
}

router.get("/blog/:slug/comments", (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const ids = getJson<string[]>(`comments:${slug}`, []);
    const comments: Comment[] = [];
    for (const id of ids) {
      const c = getJson<Comment | null>(`comment:${id}`, null);
      if (c && c.approved) comments.push(c);
    }
    res.json(comments);
  } catch {
    res.status(500).json({ error: "Failed to fetch comments" });
  }
});

const CommentSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  content: z.string().min(1).max(2000),
  parentId: z.string().optional().nullable(),
});

router.post("/blog/:slug/comments", (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const parsed = CommentSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
      return;
    }
    const counter = parseInt(kv.get("comments:counter") || "0", 10) + 1;
    const id = String(counter);
    const comment: Comment = {
      id, slug,
      parentId: parsed.data.parentId ?? null,
      name: parsed.data.name,
      email: parsed.data.email,
      content: parsed.data.content,
      approved: false,
      createdAt: new Date().toISOString(),
    };
    putJson(`comment:${id}`, comment);
    const ids = getJson<string[]>(`comments:${slug}`, []);
    ids.push(id);
    putJson(`comments:${slug}`, ids);
    kv.put("comments:counter", String(counter));
    res.status(201).json({ success: true, message: "Comment submitted for moderation." });
  } catch {
    res.status(500).json({ error: "Failed to submit comment" });
  }
});

export default router;
