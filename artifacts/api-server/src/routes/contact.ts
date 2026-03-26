import { Router } from "express";
import { z } from "zod";
import { kv, getJson, putJson } from "../lib/kv.js";

const router = Router();

const ContactSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email(),
  subject: z.string().max(300).optional().default(""),
  message: z.string().min(1).max(5000),
});

router.post("/contact", (req, res) => {
  try {
    const parsed = ContactSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
      return;
    }
    const { name, email, subject, message } = parsed.data;
    const counter = parseInt(kv.get("messages:counter") || "0", 10) + 1;
    const id = String(counter);
    const msg = { id, name, email, subject, message, read: false, createdAt: new Date().toISOString() };
    putJson(`message:${id}`, msg);
    const list = getJson<string[]>("messages:list", []);
    list.unshift(id);
    putJson("messages:list", list);
    kv.put("messages:counter", String(counter));
    res.json({ success: true, message: "Message received. Thanks!" });
  } catch {
    res.status(500).json({ error: "Failed to send message" });
  }
});

export default router;
