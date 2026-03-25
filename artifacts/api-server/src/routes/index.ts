import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import contentRouter from "./content.js";
import blogRouter from "./blog.js";
import contactRouter from "./contact.js";
import settingsRouter from "./settings.js";
import adminRouter from "./admin/index.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(contentRouter);
router.use(blogRouter);
router.use(contactRouter);
router.use(settingsRouter);
router.use("/admin", adminRouter);

export default router;
