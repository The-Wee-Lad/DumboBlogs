import { Router } from "express";
import { createArticle, 
            createShow, 
            deleteArticle, 
            getArticle, 
            getMyArticlesInBatch, 
            showPrivateArticles, 
            showPublicArticles, 
            updateArticle, 
            updateShow,
            getArticlesInBatch
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
router.route("/get-my-articles").get(verifyJWT,getArticle);
router.route("/myBlogs").get((req,res)=>{
    res.render("./Articles/MyBlogs",{title:"MyBlogs"});
})
router.route("/fetchMyBlogs").get(verifyJWT,getMyArticlesInBatch);
router.route("/fetchBlogs").get(getArticlesInBatch);
export default router;