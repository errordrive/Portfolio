import { Router } from "express";
import { db, contactMessages } from "@workspace/db";
import { z } from "zod";

const router = Router();

const ContactSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email(),
  subject: z.string().max(300).optional().default(""),
  message: z.string().min(1).max(5000),
});

router.post("/contact", async (req, res) => {
  try {
    const parsed = ContactSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
      return;
    }
    const { name, email, subject, message } = parsed.data;
    await db.insert(contactMessages).values({ name, email, subject, message });
    res.json({ success: true, message: "Message received. Thanks!" });
  } catch {
    res.status(500).json({ error: "Failed to send message" });
  }
});

export default router;
