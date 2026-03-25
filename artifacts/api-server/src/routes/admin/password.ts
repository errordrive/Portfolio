import { Router, type Request, type Response } from "express";
import { db, adminUsers } from "@workspace/db";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { requireAuth } from "../../middlewares/auth.js";
import { z } from "zod";

const router = Router();

router.use(requireAuth);

router.put("/", async (req: Request, res: Response) => {
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

    if (!rows.length) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    const valid = await bcrypt.compare(currentPassword, rows[0].passwordHash);
    if (!valid) {
      res.status(401).json({ error: "Current password is incorrect" });
      return;
    }
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
