import { Router } from "express";
import { createArticle, createShow } from "../controllers/articles.controller.js"
import { verifyJWT } from "../middlewares/auth.middlewares.js";
const router = Router();


router.route("/create").get(createShow);

router.use(verifyJWT);
router.route("/create").post(createArticle);


router.route("/update/:id")
.get()
.patch()
.delete();

export default router;