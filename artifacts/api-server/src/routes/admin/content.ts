import { Router, type Request, type Response } from "express";
import { db, contentSections } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../../middlewares/auth.js";

const router = Router();

router.use(requireAuth);

router.get("/", async (_req: Request, res: Response) => {
  try {
    const sections = await db.select().from(contentSections);
    const result: Record<string, unknown> = {};
    for (const s of sections) {
      result[s.section] = { data: s.data, visible: s.visible, updatedAt: s.updatedAt };
    }
    res.json(result);
  } catch {
    res.status(500).json({ error: "Failed to fetch content" });
  }
});

router.put("/:section", async (req: Request, res: Response) => {
  try {
    const { section } = req.params;
    const { data, visible } = req.body;

    const existing = await db
      .select()
      .from(contentSections)
      .where(eq(contentSections.section, section))
      .limit(1);

    if (!existing.length) {
      res.status(404).json({ error: "Section not found" });
      return;
    }

    await db
      .update(contentSections)
      .set({
        data: data !== undefined ? data : existing[0].data,
        visible: visible !== undefined ? Boolean(visible) : existing[0].visible,
        updatedAt: new Date(),
      })
      .where(eq(contentSections.section, section));

    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to update section" });
  }
});

export default router;
