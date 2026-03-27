import { Router } from "express";
import { kv } from "../lib/kv.js";

const router = Router();

const PUBLIC_KEYS = [
  "site_title", "site_description", "social_github", "social_linkedin",
  "social_twitter", "adsense_enabled", "adsense_publisher_id", "favicon_url",
];

router.get("/settings", (_req, res) => {
  try {
    const result: Record<string, string> = {};
    for (const key of PUBLIC_KEYS) {
      const val = kv.get(`setting:${key}`);
      if (val !== null) result[key] = val;
    }
    res.json(result);
  } catch {
    res.status(500).json({ error: "Failed to fetch settings" });
  }
});

export default router;
