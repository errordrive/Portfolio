import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { checkAdminPassword, createToken, requireAuth } from "../../lib/auth.js";

const router = Router();

const LoginSchema = z.object({ password: z.string().min(1) });

router.post("/login", (req: Request, res: Response) => {
  try {
    const parsed = LoginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid credentials" });
      return;
    }
    if (!checkAdminPassword(parsed.data.password)) {
      res.status(401).json({ error: "Invalid password" });
      return;
    }
    const token = createToken();
    res.json({ token, expiresIn: "7d" });
  } catch {
    res.status(500).json({ error: "Login failed" });
  }
});

router.get("/me", requireAuth, (_req: Request, res: Response) => {
  res.json({ username: "admin" });
});

export default router;
