import { Router } from "express";
import { db, siteSettings, cvFile } from "@workspace/db";
import { inArray, eq } from "drizzle-orm";

const router = Router();

const PUBLIC_KEYS = [
  "site_title",
  "site_description",
  "social_github",
  "social_linkedin",
  "social_twitter",
  "adsense_enabled",
  "adsense_publisher_id",
];

router.get("/settings", async (_req, res) => {
  try {
    const rows = await db
      .select()
      .from(siteSettings)
      .where(inArray(siteSettings.key, PUBLIC_KEYS));

    const result: Record<string, string> = {};
    for (const row of rows) {
      result[row.key] = row.value;
    }
    res.json(result);
  } catch {
    res.status(500).json({ error: "Failed to fetch settings" });
  }
});

router.get("/cv", async (_req, res) => {
  try {
    const rows = await db.select().from(cvFile).limit(1);
    const url = rows[0]?.url ?? "";
    res.json({ url });
  } catch {
    res.status(500).json({ error: "Failed to fetch CV" });
  }
});

export default router;
