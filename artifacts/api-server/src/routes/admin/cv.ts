import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { kv } from "../../lib/kv.js";
import { requireAuth } from "../../lib/auth.js";

const router = Router();
router.use(requireAuth);

router.get("/", (_req: Request, res: Response) => {
  try {
    res.json({ url: kv.get("cv:url") ?? "" });
  } catch {
    res.status(500).json({ error: "Failed to fetch CV" });
  }
});

router.post("/", (req: Request, res: Response) => {
  try {
    const { url } = z.object({ url: z.string().url().or(z.literal("")) }).parse(req.body);
    kv.put("cv:url", url);
    res.json({ success: true, url });
  } catch {
    res.status(400).json({ error: "Invalid URL" });
  }
});

export default router;
