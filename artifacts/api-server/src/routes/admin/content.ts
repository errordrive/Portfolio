import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { getJson, putJson } from "../../lib/kv.js";
import { requireAuth } from "../../lib/auth.js";

const router = Router();
router.use(requireAuth);

const ContentUpdateSchema = z.object({
  data: z.record(z.unknown()).optional(),
  visible: z.boolean().optional(),
});

router.get("/", (_req: Request, res: Response) => {
  try {
    const sections = getJson<string[]>("content:index", []);
    const result: Record<string, unknown> = {};
    for (const s of sections) {
      const val = getJson<unknown>(`content:${s}`, null);
      if (val !== null) result[s] = val;
    }
    res.json(result);
  } catch {
    res.status(500).json({ error: "Failed to fetch content" });
  }
});

router.put("/:section", (req: Request, res: Response) => {
  try {
    const { section } = req.params;
    const existing = getJson<{ data: unknown; visible: boolean; updatedAt: string } | null>(`content:${section}`, null) ?? { data: {}, visible: true, updatedAt: new Date().toISOString() };

    const parsed = ContentUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
      return;
    }
    const { data, visible } = parsed.data;
    const updated = {
      data: data !== undefined ? data : existing.data,
      visible: visible !== undefined ? visible : existing.visible,
      updatedAt: new Date().toISOString(),
    };
    putJson(`content:${section}`, updated);
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to update section" });
  }
});

export default router;
