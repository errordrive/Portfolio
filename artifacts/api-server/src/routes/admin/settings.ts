import { Router, type Request, type Response } from "express";
import { db, siteSettings } from "@workspace/db";
import { requireAuth } from "../../middlewares/auth.js";
import { z } from "zod";

const router = Router();

router.use(requireAuth);

const SettingsUpdateSchema = z.record(z.string(), z.string());

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
    const parsed = SettingsUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Expected an object of string key/value pairs", details: parsed.error.flatten() });
      return;
    }
    for (const [key, value] of Object.entries(parsed.data)) {
      await db
        .insert(siteSettings)
        .values({ key, value, updatedAt: new Date() })
        .onConflictDoUpdate({
          target: siteSettings.key,
          set: { value, updatedAt: new Date() },
        });
    }
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to update settings" });
  }
});

export default router;
