import { Router } from "express";
import {} from "../controllers/articles.controller.js"
const router = Router();

router.route("/create")
.get()
.post();

router.route("/update/:id")
.get()
.patch()
.delete();

export default router;