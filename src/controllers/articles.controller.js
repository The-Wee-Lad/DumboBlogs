import mongoose from "mongoose";
import { Articles } from "../models/articles.model.js"
import { ApiResponse } from "../utils/ApiResponse.utils.js";
import { asyncHandler } from "../utils/asyncHandler.js"
import {JSDOM} from "jsdom";
import createDOMpurify from "dompurify";
import { marked } from "marked";

const createShow = asyncHandler(async(req, res) => {
    res.render("./Articles/CreateArticle",{
    title:"New Article",
    article: new Articles(),
    });
});

const createArticle = asyncHandler(async (req, res) => {
    
    const {formData} = req.body;
    const window = new JSDOM('').window;
    const DOMPurify = createDOMpurify(window);
    const cleanMarkdown =  DOMPurify.sanitize(formData.markdown);
    const article = await Articles.create({
        title: formData.title,
        description: formData.description,
        markdown: cleanMarkdown,
        author: req.user?._id,
        isPublic: formData.isPublic,
    });
    if(!article){
        res.status(401).json(new ApiResponse(401,{},"couldn't create new article, try again",401));
        throw new Error("DB error in article creation");
    }
    res.status(200).json(new ApiResponse(200,article,"Created the Article",200));
});

const updateShow = asyncHandler(async (req, res) => {
    
});

const updateArticle = asyncHandler(async (req, res) => {
    
});

const deleteArticle = asyncHandler(async (req, res) => {
    
});

const showArticle = asyncHandler(async (req, res) => {
    const articleId = req.params.id;
    if(!mongoose.isValidObjectId(articleId)){
        res.status(400).redirect("/");
        // res.status(400).json(new ApiResponse(400,{},"Not Valid Token",713));
        throw new Error("No Such article Found");
    }
    const article = (await Articles.aggregate([
        {
            $match:{_id:new mongoose.Types.ObjectId(articleId)}
        },
        {
            $lookup:{
                from:"users",
                localField:"author",
                foreignField:"_id",
                as:"author",
                pipeline:[
                    {
                        $project:{
                            refreshToken:0,
                            role:0,
                            password:0,
                            email:0
                        }
                    }
                ]
            }
        },
        {
            $unwind:"$author" 
        }
    ]))[0];
    // console.log("Checking : ",!article,(article.isPublic));
    if(!article || !(article.isPublic)){
        res.status(400+!(article.isPublic)).redirect("/");
        // res.status(401).json(new ApiResponse(401,{},"No Such article Found or Private Article",714));
        throw new Error("No Such article Found or Private Article"+400+!(article.isPublic));
    }
    // res.status(200).json(new ApiResponse);
    article.markdown = marked.parse(article.markdown);
    
    res.status(200).render("./Articles/showArticle",{
        title:"Article",
        article:article,
    });
});

export {
    createShow,
    createArticle,
    updateShow,
    updateArticle,
    showArticle,
    deleteArticle,
}


