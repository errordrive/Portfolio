import { Router } from "express";
import authRouter from "./auth.js";
import contentRouter from "./content.js";
import blogRouter from "./blog.js";
import messagesRouter from "./messages.js";
import settingsRouter from "./settings.js";

const router = Router();

router.use(authRouter);
router.use("/content", contentRouter);
router.use("/blog", blogRouter);
router.use("/messages", messagesRouter);
router.use("/settings", settingsRouter);

export default router;
