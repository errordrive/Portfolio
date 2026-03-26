import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { kv } from "../../lib/kv.js";
import { requireAuth } from "../../lib/auth.js";

const router = Router();
router.use(requireAuth);

const SettingsUpdateSchema = z.record(z.string(), z.string());

router.get("/", (_req: Request, res: Response) => {
  try {
    const keys = kv.list("setting:");
    const result: Record<string, string> = {};
    for (const k of keys) {
      const val = kv.get(k);
      if (val !== null) result[k.replace("setting:", "")] = val;
    }
    res.json(result);
  } catch {
    res.status(500).json({ error: "Failed to fetch settings" });
  }
});

router.put("/", (req: Request, res: Response) => {
  try {
    const parsed = SettingsUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Expected an object of string key/value pairs", details: parsed.error.flatten() });
      return;
    }
    for (const [key, value] of Object.entries(parsed.data)) {
      kv.put(`setting:${key}`, value);
    }
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to update settings" });
  }
});

export default router;
