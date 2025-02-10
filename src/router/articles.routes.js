import { Router } from "express";
import { createArticle, 
            createShow, 
            deleteArticle, 
            getArticle, 
            showPrivateArticles, 
            showPublicArticles, 
            updateArticle, 
            updateShow
        } from "../controllers/articles.controller.js"
import { verifyJWT } from "../middlewares/auth.middlewares.js";
const router = Router();


router.route("/create").get(createShow);
router.route("/show/:id").get(showPublicArticles);
router.route("/create").post(verifyJWT,createArticle);
router.route("/update/:id")
.get(updateShow)
.patch(verifyJWT,updateArticle)
.delete(verifyJWT,deleteArticle);
router.route("/show-pri/:id").get(showPrivateArticles);
router.route("/get/:id").get(verifyJWT,getArticle);
export default router;