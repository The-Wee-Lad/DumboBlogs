import { Articles } from "../models/articles.model.js"
import { ApiResponse } from "../utils/ApiResponse.utils.js";
import { asyncHandler } from "../utils/asyncHandler.js"

const createShow = asyncHandler(async(req, res) => {
    res.render("./Articles/CreateArticle",{
    title:"New Article",
    article: new Articles(),
    });
});

const createArticle = asyncHandler(async (req, res) => {
    const {formData} = req.body; 
    const article = await Articles.create({
        title: formData.title,
        description: formData.description,
        markdown: formData.markdown,
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

});

export {
    createShow,
    createArticle,
    updateShow,
    updateArticle,
    showArticle,
}


