import { Router, type Request, type Response } from "express";
import { db, cvFile } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../../middlewares/auth.js";
import { z } from "zod";

const router = Router();

router.use(requireAuth);

router.get("/", async (_req: Request, res: Response) => {
  try {
    const rows = await db.select().from(cvFile).limit(1);
    res.json({ url: rows[0]?.url ?? "" });
  } catch {
    res.status(500).json({ error: "Failed to fetch CV" });
  }
});

router.post("/", async (req: Request, res: Response) => {
  try {
    const { url } = z.object({ url: z.string().url().or(z.literal("")) }).parse(req.body);
    const existing = await db.select().from(cvFile).limit(1);
    if (existing.length) {
      await db.update(cvFile).set({ url, updatedAt: new Date() }).where(eq(cvFile.id, existing[0].id));
    } else {
      await db.insert(cvFile).values({ url });
    }
    res.json({ success: true, url });
  } catch {
    res.status(400).json({ error: "Invalid URL" });
  }
});

export default router;
