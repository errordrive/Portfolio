import { Router, type Request, type Response } from "express";
import { kv, getJson, putJson } from "../../lib/kv.js";
import { requireAuth } from "../../lib/auth.js";

const router = Router();
router.use(requireAuth);

interface Message {
  id: string; name: string; email: string; subject: string;
  message: string; read: boolean; createdAt: string;
}

router.get("/", (_req: Request, res: Response) => {
  try {
    const ids = getJson<string[]>("messages:list", []);
    const messages: Message[] = ids
      .map(id => getJson<Message | null>(`message:${id}`, null))
      .filter((m): m is Message => m !== null);
    res.json(messages);
  } catch {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

router.patch("/:id", (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const msg = getJson<Message | null>(`message:${id}`, null);
    if (!msg) { res.status(404).json({ error: "Message not found" }); return; }
    const updated = { ...msg, read: !msg.read };
    putJson(`message:${id}`, updated);
    res.json(updated);
  } catch {
    res.status(500).json({ error: "Failed to update message" });
  }
});

router.delete("/:id", (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!getJson(`message:${id}`, null)) { res.status(404).json({ error: "Message not found" }); return; }
    kv.delete(`message:${id}`);
    const list = getJson<string[]>("messages:list", []);
    putJson("messages:list", list.filter(i => i !== id));
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to delete message" });
  }
});

export default router;
