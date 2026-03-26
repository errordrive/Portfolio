import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { checkAdminPassword, changeAdminPassword, createToken, requireAuth } from "../../lib/auth.js";

const router = Router();
router.use(requireAuth);

router.put("/", (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword } = z.object({
      currentPassword: z.string().min(1),
      newPassword: z.string().min(6),
    }).parse(req.body);

    if (!checkAdminPassword(currentPassword)) {
      res.status(401).json({ error: "Current password is incorrect" });
      return;
    }
    changeAdminPassword(newPassword);
    const token = createToken();
    res.json({ success: true, token });
  } catch {
    res.status(400).json({ error: "Invalid input" });
  }
});

export default router;
