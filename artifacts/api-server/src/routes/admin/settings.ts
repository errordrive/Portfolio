import { Router, type Request, type Response } from "express";
import { db, siteSettings, cvFile, adminUsers } from "@workspace/db";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { requireAuth } from "../../middlewares/auth.js";
import { z } from "zod";

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

router.get("/cv", async (_req: Request, res: Response) => {
  try {
    const rows = await db.select().from(cvFile).limit(1);
    res.json({ url: rows[0]?.url ?? "" });
  } catch {
    res.status(500).json({ error: "Failed to fetch CV" });
  }
});

router.post("/cv", async (req: Request, res: Response) => {
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

router.put("/password", async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword } = z.object({
      currentPassword: z.string().min(1),
      newPassword: z.string().min(6),
    }).parse(req.body);

    const user = (req as Request & { user: { userId: number } }).user;
    const rows = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.id, user.userId))
      .limit(1);

    if (!rows.length) { res.status(404).json({ error: "User not found" }); return; }

    const valid = await bcrypt.compare(currentPassword, rows[0].passwordHash);
    if (!valid) { res.status(401).json({ error: "Current password is incorrect" }); return; }

    const newHash = await bcrypt.hash(newPassword, 10);
    await db
      .update(adminUsers)
      .set({ passwordHash: newHash })
      .where(eq(adminUsers.id, user.userId));

    res.json({ success: true });
  } catch {
    res.status(400).json({ error: "Invalid input" });
  }
});

export default router;
