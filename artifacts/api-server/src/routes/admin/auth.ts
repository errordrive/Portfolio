import { Router, type Request, type Response } from "express";
import { db, adminUsers } from "@workspace/db";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { signToken, requireAuth } from "../../middlewares/auth.js";

const router = Router();

const LoginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

router.post("/login", async (req: Request, res: Response) => {
  try {
    const parsed = LoginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid credentials" });
      return;
    }
    const { username, password } = parsed.data;
    const rows = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.username, username))
      .limit(1);

    if (!rows.length) {
      res.status(401).json({ error: "Invalid username or password" });
      return;
    }
    const user = rows[0];
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "Invalid username or password" });
      return;
    }
    const token = signToken({ userId: user.id, username: user.username });
    res.json({ token, expiresIn: "7d", username: user.username });
  } catch {
    res.status(500).json({ error: "Login failed" });
  }
});

router.get("/me", requireAuth, (req: Request, res: Response) => {
  const user = (req as Request & { user: { userId: number; username: string } }).user;
  res.json({ userId: user.userId, username: user.username });
});

export default router;
