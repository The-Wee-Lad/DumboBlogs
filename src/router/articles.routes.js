import { Router } from "express";
import { createShow } from "../controllers/articles.controller.js"
import { verifyJWT } from "../middlewares/auth.middlewares.js";
const router = Router();

router.use(verifyJWT);

router.route("/create")
.get(createShow)
.post();

router.route("/update/:id")
.get()
.patch()
.delete();

export default router;