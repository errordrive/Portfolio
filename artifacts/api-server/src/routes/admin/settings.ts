import { Router, type Request, type Response } from "express";
import { db, siteSettings } from "@workspace/db";
import { requireAuth } from "../../middlewares/auth.js";

const router = Router();

router.use(requireAuth);

router.get("/", async (_req: Request, res: Response) => {
  try {
    const rows = await db.select().from(siteSettings);
    const result: Record<string, string> = {};
    for (const row of rows) result[row.key] = row.value;
    res.json(result);
  } catch {
    res.status(500).json({ error: "Failed to fetch settings" });
  }
});

router.put("/", async (req: Request, res: Response) => {
  try {
    const updates = req.body as Record<string, string>;
    if (typeof updates !== "object" || Array.isArray(updates)) {
      res.status(400).json({ error: "Expected key/value object" });
      return;
    }
    for (const [key, value] of Object.entries(updates)) {
      await db
        .insert(siteSettings)
        .values({ key, value: String(value), updatedAt: new Date() })
        .onConflictDoUpdate({
          target: siteSettings.key,
          set: { value: String(value), updatedAt: new Date() },
        });
    }
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to update settings" });
  }
});

export default router;
