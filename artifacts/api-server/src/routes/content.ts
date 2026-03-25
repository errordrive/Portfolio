import { Router } from "express";
import { db, contentSections } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/content", async (_req, res) => {
  try {
    const sections = await db.select().from(contentSections);
    const result: Record<string, unknown> = {};
    for (const s of sections) {
      result[s.section] = { data: s.data, visible: s.visible };
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch content" });
  }
});

router.get("/content/:section", async (req, res) => {
  try {
    const { section } = req.params;
    const rows = await db
      .select()
      .from(contentSections)
      .where(eq(contentSections.section, section))
      .limit(1);

    if (!rows.length) {
      res.status(404).json({ error: "Section not found" });
      return;
    }
    res.json({ data: rows[0].data, visible: rows[0].visible });
  } catch {
    res.status(500).json({ error: "Failed to fetch section" });
  }
});

export default router;
