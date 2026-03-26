import { Router } from "express";
import { getJson } from "../lib/kv.js";

const router = Router();

router.get("/content", (_req, res) => {
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

router.get("/content/:section", (req, res) => {
  try {
    const { section } = req.params;
    const val = getJson<unknown>(`content:${section}`, null);
    if (!val) {
      res.status(404).json({ error: "Section not found" });
      return;
    }
    res.json(val);
  } catch {
    res.status(500).json({ error: "Failed to fetch section" });
  }
});

export default router;
